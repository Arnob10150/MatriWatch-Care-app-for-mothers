import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";
import { usersTable } from "./users";
import { clinicsTable } from "./clinics";

export const staffTable = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStaffSchema = insertSchemaFor(staffTable);
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staffTable.$inferSelect;
