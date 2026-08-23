// @ts-nocheck
import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";
import { eventsTable } from "./events";

export const ticketStatusEnum = pgEnum("ticket_status", ["Open", "In Progress", "Resolved", "Terminated"]);

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  reply: text("reply"),
  assignedTo: integer("assigned_to").references(() => usersTable.id), // Organiser ID
  status: ticketStatusEnum("status").default("Open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTicketsTable).omit({ id: true, createdAt: true }) as any;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;
