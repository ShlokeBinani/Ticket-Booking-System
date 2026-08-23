"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEventSchema = exports.showPricingTable = exports.showsTable = exports.eventsTable = void 0;
// @ts-nocheck
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const venues_1 = require("./venues");
const users_1 = require("./users");
exports.eventsTable = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    organiserId: (0, pg_core_1.integer)("organiser_id").notNull().references(() => users_1.usersTable.id),
    title: (0, pg_core_1.text)("title").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // e.g. "Movie", "Concert"
    description: (0, pg_core_1.text)("description"),
    image: (0, pg_core_1.text)("image"),
    category: (0, pg_core_1.text)("category").notNull(),
    rating: (0, pg_core_1.integer)("rating"),
});
exports.showsTable = (0, pg_core_1.pgTable)("shows", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    eventId: (0, pg_core_1.integer)("event_id").notNull().references(() => exports.eventsTable.id),
    venueId: (0, pg_core_1.integer)("venue_id").notNull().references(() => venues_1.venuesTable.id),
    showDate: (0, pg_core_1.timestamp)("show_date").notNull(),
});
exports.showPricingTable = (0, pg_core_1.pgTable)("show_pricing", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    showId: (0, pg_core_1.integer)("show_id").notNull().references(() => exports.showsTable.id),
    categoryId: (0, pg_core_1.integer)("category_id").notNull(), // Reference to seat_categories
    price: (0, pg_core_1.integer)("price").notNull(), // In Rupees
});
exports.insertEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.eventsTable).omit({ id: true });
