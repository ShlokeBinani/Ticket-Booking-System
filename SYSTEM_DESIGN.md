# Ticket Booking System Design

## 1. Architecture & API Design
The platform is designed as a modern, decoupled full-stack application, ensuring robust performance and strict isolation of concerns. 
- **Frontend**: A React-based Single Page Application (SPA) powered by Vite, utilizing a component-driven architecture for the UI and short-polling for real-time seat availability updates.
- **Backend API**: An Express.js RESTful API, enforcing Role-Based Access Control (RBAC) via JWT authentication. It strictly isolates customer-facing operations, organiser dashboards, and administrative commands.
- **Database**: PostgreSQL paired with Drizzle ORM ensures ACID compliance—a hard requirement for any inventory or ticketing system. The schema separates `users`, `venues`, `events`, `shows`, `seats`, `bookings`, and `waitlists`.
- **Documentation**: All API contracts are documented and validated against Zod schemas, offering type-safety from database to frontend client.

## 2. Seat Hold TTL and Auto-Release Mechanism
Treating seats as a scarce, highly-contested resource requires a robust state machine. Seats are not merely "available" or "booked." During checkout, they enter a "held" state.
- **Hold Logic**: When a user selects seats, the API inserts a hold record (or updates the seat's `held_until` timestamp) configuring a Time-To-Live (TTL) of 10 minutes.
- **Auto-Release**: If a checkout is abandoned, the TTL expires. The database inherently treats any seat where `held_until < NOW()` as `available`. A background sweeper process periodically purges expired holds, ensuring the database stays clean and triggering waitlist allocations without relying strictly on synchronous client actions.

## 3. Concurrency Protection
High-demand events (e.g., popular movie premieres or concerts) can cause severe race conditions if two customers attempt to book the exact same seat simultaneously. 
- **Database-Level Locks**: The system mitigates this by leveraging Postgres transactions and row-level locking (`SELECT ... FOR UPDATE`). 
- **Atomic Operations**: When a hold is requested, the system attempts to update the seat only if its status is `available` or the previous hold has expired. The database serializes these simultaneous requests. The first transaction succeeds and locks the seat, while the subsequent concurrent transaction will read the updated state, fail the availability check, and gracefully return a `409 Conflict` to the user, prompting a UI refresh.

## 4. Waitlist Auto-Assignment and Time-Limited Offers
To prevent revenue loss on sold-out shows, a robust waitlist queue is implemented per event and seat category (e.g., Premium vs. Standard).
- **Queueing**: Customers join a first-in, first-out (FIFO) waitlist when their desired category sells out.
- **Auto-Assignment Flow**: When a confirmed booking is cancelled, or a held seat is permanently abandoned, the background sweeper identifies the newly available seat. It then dequeues the first eligible customer from the waitlist and generates a **Time-Limited Offer** (e.g., 1 hour to claim).
- **Offer Handling**: The user receives an automated email containing a securely signed, single-use claim link. If the user completes the checkout within the window, the booking is confirmed. If the offer expires, the sweeper revokes the offer and instantly assigns the seat to the next person in the queue, ensuring maximum occupancy with zero manual intervention.

## 5. QR Code Generation and Email Delivery
Every confirmed ticket generates a unique, verifiable QR code.
- **Generation**: Upon successful payment or checkout confirmation, the backend generates a QR code string encoding a secure, stable `booking_reference`.
- **Delivery**: The system integrates with an external transactional email provider (e.g., Resend or SendGrid). The booking confirmation triggers an asynchronous worker that constructs an HTML email with the embedded QR code and event details. Retries for failed emails are handled idempotently to ensure customers always receive their tickets without risking duplicate bookings in the database. 
- **Scanning**: At the venue, the QR code is scanned, transmitting the `booking_reference` back to the API for real-time validation, preventing fraudulent or duplicated tickets from granting entry.

## 6. Real-Time Status Updates (Seat Map Data Model)
The seat map data model is designed to represent real-time ground truth.
- **Data Model**: The `seats` table maintains explicit relationships to the `show` and tracks state (`status: available | held | booked`). 
- **Client Syncing**: The frontend fetches the initial seat map and then relies on optimized short-polling (which can easily be swapped for WebSockets or Postgres NOTIFY in a scaled environment). Because the client is aware of the server-provided `held_until` timestamp, it can locally invalidate seats and display accurate countdown timers, ensuring the UI remains snappy and truthful to the database state.
