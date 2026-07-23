import { pgTable, uuid, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { insertSchemaFor } from "./_insert-schema";
import { mothersTable } from "./mothers";

export const epdsResponsesTable = pgTable("epds_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  motherId: uuid("mother_id").references(() => mothersTable.id, { onDelete: "cascade" }),
  responses: jsonb("responses").notNull(),
  totalScore: integer("total_score").notNull(),
  ppdFlagged: boolean("ppd_flagged").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEpdsResponseSchema = insertSchemaFor(epdsResponsesTable);
export type InsertEpdsResponse = z.infer<typeof insertEpdsResponseSchema>;
export type EpdsResponse = typeof epdsResponsesTable.$inferSelect;
