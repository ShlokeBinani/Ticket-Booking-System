"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUserSchema = exports.usersTable = exports.roleEnum = void 0;
// @ts-nocheck
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["admin", "organiser", "customer"]);
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, exports.roleEnum)("role").default("customer").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.usersTable).omit({ id: true, createdAt: true });
