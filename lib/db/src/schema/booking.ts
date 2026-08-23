// @ts-nocheck
import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { showsTable } from "./events";
import { usersTable } from "./users";
import { seatLayoutsTable } from "./venues";

export const seatStatusEnum = pgEnum("seat_status", ["available", "held", "booked"]);

export const showSeatsTable = pgTable("show_seats", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => showsTable.id),
  seatLayoutId: integer("seat_layout_id").notNull().references(() => seatLayoutsTable.id),
  status: seatStatusEnum("status").default("available").notNull(),
  heldBy: integer("held_by").references(() => usersTable.id),
  heldUntil: timestamp("held_until"),
});

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  showId: integer("show_id").notNull().references(() => showsTable.id),
  bookingReference: text("booking_reference").notNull().unique(),
  totalAmount: integer("total_amount").notNull(), // In Rupees
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("confirmed").notNull(),
});

export const bookingSeatsTable = pgTable("booking_seats", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id),
  showSeatId: integer("show_seat_id").notNull().references(() => showSeatsTable.id),
});

export const waitlistTable = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  showId: integer("show_id").notNull().references(() => showsTable.id),
  categoryId: integer("category_id").notNull(), // Reference to seat_categories
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  status: text("status").default("waiting").notNull(), // waiting, offered, claimed, expired
  offerExpiresAt: timestamp("offer_expires_at"),
  offeredSeatId: integer("offered_seat_id").references(() => showSeatsTable.id),
});
