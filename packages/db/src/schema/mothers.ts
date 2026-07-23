import { pgTable, text, uuid, integer, date, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";
import { usersTable } from "./users";
import { clinicsTable } from "./clinics";

export const mothersTable = pgTable("mothers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gestationalAge: integer("gestational_age"),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "set null" }),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMotherSchema = insertSchemaFor(mothersTable);
export type InsertMother = z.infer<typeof insertMotherSchema>;
export type Mother = typeof mothersTable.$inferSelect;
