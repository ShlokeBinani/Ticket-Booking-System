// @ts-nocheck
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { venuesTable } from "./venues";
import { usersTable } from "./users";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  organiserId: integer("organiser_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // e.g. "Movie", "Concert"
  description: text("description"),
  image: text("image"),
  category: text("category").notNull(),
  rating: integer("rating"),
});

export const showsTable = pgTable("shows", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  venueId: integer("venue_id").notNull().references(() => venuesTable.id),
  showDate: timestamp("show_date").notNull(),
});

export const showPricingTable = pgTable("show_pricing", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => showsTable.id),
  categoryId: integer("category_id").notNull(), // Reference to seat_categories
  price: integer("price").notNull(), // In Rupees
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true }) as any;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
