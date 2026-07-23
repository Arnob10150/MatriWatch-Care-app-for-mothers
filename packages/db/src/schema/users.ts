import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";

export const userRoleEnum = pgEnum("user_role", ["mother", "clinic_staff", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("mother"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = insertSchemaFor(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
