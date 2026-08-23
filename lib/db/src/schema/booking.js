"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitlistTable = exports.bookingSeatsTable = exports.bookingsTable = exports.showSeatsTable = exports.seatStatusEnum = void 0;
// @ts-nocheck
const pg_core_1 = require("drizzle-orm/pg-core");
const events_1 = require("./events");
const users_1 = require("./users");
const venues_1 = require("./venues");
exports.seatStatusEnum = (0, pg_core_1.pgEnum)("seat_status", ["available", "held", "booked"]);
exports.showSeatsTable = (0, pg_core_1.pgTable)("show_seats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    showId: (0, pg_core_1.integer)("show_id").notNull().references(() => events_1.showsTable.id),
    seatLayoutId: (0, pg_core_1.integer)("seat_layout_id").notNull().references(() => venues_1.seatLayoutsTable.id),
    status: (0, exports.seatStatusEnum)("status").default("available").notNull(),
    heldBy: (0, pg_core_1.integer)("held_by").references(() => users_1.usersTable.id),
    heldUntil: (0, pg_core_1.timestamp)("held_until"),
});
exports.bookingsTable = (0, pg_core_1.pgTable)("bookings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => users_1.usersTable.id),
    showId: (0, pg_core_1.integer)("show_id").notNull().references(() => events_1.showsTable.id),
    bookingReference: (0, pg_core_1.text)("booking_reference").notNull().unique(),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(), // In Rupees
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("confirmed").notNull(),
});
exports.bookingSeatsTable = (0, pg_core_1.pgTable)("booking_seats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    bookingId: (0, pg_core_1.integer)("booking_id").notNull().references(() => exports.bookingsTable.id),
    showSeatId: (0, pg_core_1.integer)("show_seat_id").notNull().references(() => exports.showSeatsTable.id),
});
exports.waitlistTable = (0, pg_core_1.pgTable)("waitlist", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => users_1.usersTable.id),
    showId: (0, pg_core_1.integer)("show_id").notNull().references(() => events_1.showsTable.id),
    categoryId: (0, pg_core_1.integer)("category_id").notNull(), // Reference to seat_categories
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("waiting").notNull(), // waiting, offered, claimed, expired
    offerExpiresAt: (0, pg_core_1.timestamp)("offer_expires_at"),
    offeredSeatId: (0, pg_core_1.integer)("offered_seat_id").references(() => exports.showSeatsTable.id),
});
