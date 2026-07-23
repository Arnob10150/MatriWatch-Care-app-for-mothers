import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location"),
  contact: text("contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClinicSchema = insertSchemaFor(clinicsTable);
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinicsTable.$inferSelect;
