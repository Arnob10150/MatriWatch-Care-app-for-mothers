import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";
import { mothersTable } from "./mothers";
import { clinicsTable } from "./clinics";

export const alertsTable = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  motherId: uuid("mother_id").references(() => mothersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "cascade" }),
  alertType: text("alert_type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAlertSchema = insertSchemaFor(alertsTable);
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
