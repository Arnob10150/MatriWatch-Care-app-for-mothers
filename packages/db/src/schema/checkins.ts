import { pgTable, uuid, integer, real, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mothersTable } from "./mothers";

export const riskLevelEnum = pgEnum("risk_level", ["low", "mid", "high"]);

export const checkinsTable = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  motherId: uuid("mother_id").references(() => mothersTable.id, { onDelete: "cascade" }),
  bpSystolic: integer("bp_systolic"),
  bpDiastolic: integer("bp_diastolic"),
  bloodSugar: real("blood_sugar"),
  bodyTemp: real("body_temp"),
  heartRate: integer("heart_rate"),
  symptoms: text("symptoms").array(),
  notes: text("notes"),
  riskScore: real("risk_score"),
  riskLevel: riskLevelEnum("risk_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
