# System Design: Paradox Ticket Platform

## Overview

Paradox is a full-stack event ticketing platform that solves the core distributed-systems challenge of selling a finite, non-fungible inventory (physical seats) to concurrent users over the internet. The system guarantees that no two customers can book the same seat, provides a fair waitlist mechanism, and delivers e-tickets with QR codes — all while maintaining sub-second response times under concurrent load.

The architecture follows a monorepo workspace pattern: a React 19 SPA frontend communicates over REST with an Express 5 API server, both backed by a PostgreSQL database accessed through Drizzle ORM. The backend is deployed on Render (persistent server with background sweeper), while the frontend is deployed on Vercel.

---

## Seat Hold and TTL Mechanism

The booking flow is split into two discrete phases — **hold** and **confirm** — connected by a time-to-live (TTL) window.

**Phase 1: Hold.** When a user selects seats on the interactive seat map and clicks "Proceed", the frontend sends `POST /api/shows/:id/holds` with the selected seat IDs. The server opens a database transaction, acquires row-level locks on the target `show_seats` rows using `SELECT … FOR UPDATE`, validates that every seat is either `available` or has an expired hold, then atomically sets `status = 'held'`, `held_by = userId`, and `held_until = NOW() + 10 minutes`. The response includes the hold expiry timestamp, which the frontend uses to render a live countdown timer in the UI.

**Phase 2: Confirm.** The user fills in contact and payment details, then submits `POST /api/bookings`. The server re-validates that the user's held seats still have `held_until > NOW()`. If the hold has expired, it returns `410 Gone` and the user must re-select. If valid, a transaction atomically transitions the seats from `held` → `booked`, creates a `bookings` record with a unique reference code, and inserts `booking_seats` join records. A confirmation email with an embedded QR code (generated via QuickChart) is dispatched before the response is returned.

**Auto-Release.** Expired holds are reclaimed through three complementary layers: (1) a **background sweeper** (`setInterval` at 30-second intervals) bulk-updates all seats where `status = 'held' AND held_until < NOW()` back to `available`; (2) the `GET /shows/:id/seats` endpoint performs a **view-time filter**, reporting expired holds as `available` to other users browsing the seat map; (3) the booking endpoint itself **rejects stale holds** with a `410` status code. This triple-layer approach ensures seats are never permanently locked even if the sweeper experiences momentary delays.

---

## Concurrency Prevention

The central invariant is: **a seat can only be held or booked by exactly one user at any point in time.**

This is enforced at the database level using PostgreSQL's `SELECT … FOR UPDATE` within a serializable transaction. When two users attempt to hold the same seat simultaneously, the first transaction acquires an exclusive row-level lock. The second transaction blocks at the `SELECT … FOR UPDATE` statement until the first transaction commits. Upon resuming, the second transaction sees the updated `status = 'held'` with a valid `held_until` timestamp and a different `held_by` user ID, causing the validation check to fail. The server returns `409 Conflict` to the second user with the message "Seat is currently held by someone else."

This approach was chosen over application-level mutexes or Redis distributed locks because it pushes the correctness guarantee into PostgreSQL itself — the single source of truth for seat state. It handles all edge cases including server restarts, multi-instance deployments, and partial transaction failures, without requiring external coordination infrastructure.

Booking confirmation also runs inside a transaction: the seat status transition from `held` → `booked`, the booking record insertion, and the booking-seats join record creation are all atomic. If any step fails, the entire transaction rolls back and the seats remain in their previous state.

---

## Waitlist Auto-Assignment Flow

When all seats for a show are sold out, users can join a FIFO waitlist via `POST /api/waitlist`, which records their `userId`, `showId`, preferred seat `categoryId`, and `joinedAt` timestamp with `status = 'waiting'`.

Seats re-enter the available pool through two channels: **booking cancellation** and **hold expiry**. Both trigger the same waitlist assignment logic.

**Cancellation-triggered assignment.** When a user cancels via `POST /api/bookings/:id/cancel`, the server first releases the booked seats within a transaction (setting `status = 'available'`, clearing `held_by` and `held_until`, and deleting the booking and booking-seats records). It then iterates over each released seat and queries for the oldest `waiting` waitlist entry for that show, ordered by `joinedAt`. If found, the seat is immediately re-held with a 10-minute offer window, and the waitlist entry is updated to `status = 'offered'` with `offeredSeatId` and `offerExpiresAt` set. An email notification is dispatched to the waitlisted user containing a claim link.

**Sweeper-triggered assignment.** The background sweeper, after releasing expired holds, scans for `available` seats and matches them against `waiting` waitlist entries using the same FIFO ordering. Sweeper-initiated offers use a longer **1-hour claim window** to account for email delivery latency and the user not being actively online.

---

## Time-Limited Offer Handling

The waitlist offer is a time-boxed commitment: the seat is held for the offered user, but if they don't claim it within the window, it's automatically released for the next person in line.

**Claiming an offer.** The user clicks the claim link in their email, which hits `POST /api/waitlist/claim` with their waitlist entry ID as a token. The server validates: (a) the entry exists and has `status = 'offered'`; (b) `offeredSeatId` is set; (c) `offerExpiresAt > NOW()`. If all checks pass, a transaction atomically creates a new booking, inserts a booking-seats record, transitions the seat to `booked`, and updates the waitlist entry to `claimed`. A confirmation email is sent.

**Offer expiry.** If the user doesn't claim in time, two mechanisms handle cleanup: (1) a late claim attempt hits the expiry check in the claim endpoint, which sets the waitlist entry to `expired` and releases the seat back to `available`; (2) the background sweeper's expired-hold cleanup automatically releases the seat (since the offer hold uses the same `held_until` column), making it available for the next sweeper cycle to re-assign to the next waitlister.

This creates a self-healing cycle: seat released → offered to next person → unclaimed → seat released → offered to the person after that — continuing until someone claims or the waitlist is exhausted.

---

## Summary

The system's reliability rests on three pillars: **PostgreSQL row-level locks** for correctness under concurrency, **TTL-based holds** with triple-layer auto-release for liveness, and **FIFO waitlist assignment** with time-limited offers for fairness. Together, these mechanisms ensure that every seat is either definitively booked by exactly one customer or available for purchase — never stuck in an inconsistent intermediate state.
