"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSupportTicketSchema = exports.supportTicketsTable = exports.ticketStatusEnum = void 0;
// @ts-nocheck
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const users_1 = require("./users");
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)("ticket_status", ["Open", "In Progress", "Resolved", "Terminated"]);
exports.supportTicketsTable = (0, pg_core_1.pgTable)("support_tickets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => users_1.usersTable.id),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    reply: (0, pg_core_1.text)("reply"),
    assignedTo: (0, pg_core_1.integer)("assigned_to").references(() => users_1.usersTable.id), // Organiser ID
    status: (0, exports.ticketStatusEnum)("status").default("Open").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertSupportTicketSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supportTicketsTable).omit({ id: true, createdAt: true });
