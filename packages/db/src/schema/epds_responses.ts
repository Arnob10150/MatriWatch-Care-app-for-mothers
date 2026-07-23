import { pgTable, uuid, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { mothersTable } from "./mothers";

export const epdsResponsesTable = pgTable("epds_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  motherId: uuid("mother_id").references(() => mothersTable.id, { onDelete: "cascade" }),
  responses: jsonb("responses").notNull(),
  totalScore: integer("total_score").notNull(),
  ppdFlagged: boolean("ppd_flagged").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEpdsResponseSchema = createInsertSchema(epdsResponsesTable).omit({ id: true, createdAt: true });
export type InsertEpdsResponse = z.infer<typeof insertEpdsResponseSchema>;
export type EpdsResponse = typeof epdsResponsesTable.$inferSelect;
