import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const venuesTable = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
});

export const insertVenueSchema = createInsertSchema(venuesTable).omit({ id: true }) as any;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venuesTable.$inferSelect;

export const seatCategoriesTable = pgTable("seat_categories", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venuesTable.id),
  name: text("name").notNull(), // e.g. "Premium", "Standard"
});

export const seatLayoutsTable = pgTable("seat_layouts", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venuesTable.id),
  categoryId: integer("category_id").notNull().references(() => seatCategoriesTable.id),
  row: text("row").notNull(),
  number: integer("number").notNull(),
});
