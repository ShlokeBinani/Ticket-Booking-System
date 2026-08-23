"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seatLayoutsTable = exports.seatCategoriesTable = exports.insertVenueSchema = exports.venuesTable = void 0;
// @ts-nocheck
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.venuesTable = (0, pg_core_1.pgTable)("venues", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    city: (0, pg_core_1.text)("city").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    capacity: (0, pg_core_1.integer)("capacity").default(120).notNull(),
});
exports.insertVenueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.venuesTable).omit({ id: true });
exports.seatCategoriesTable = (0, pg_core_1.pgTable)("seat_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    venueId: (0, pg_core_1.integer)("venue_id").notNull().references(() => exports.venuesTable.id),
    name: (0, pg_core_1.text)("name").notNull(), // e.g. "Premium", "Standard"
});
exports.seatLayoutsTable = (0, pg_core_1.pgTable)("seat_layouts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    venueId: (0, pg_core_1.integer)("venue_id").notNull().references(() => exports.venuesTable.id),
    categoryId: (0, pg_core_1.integer)("category_id").notNull().references(() => exports.seatCategoriesTable.id),
    row: (0, pg_core_1.text)("row").notNull(),
    number: (0, pg_core_1.integer)("number").notNull(),
});
