import type { Table } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Columns every table generates server-side; never accepted from clients.
 */
type GeneratedColumn = "id" | "createdAt";

/**
 * Insert shape for a table, minus the server-generated columns.
 */
type InsertShape<TTable extends Table> = Omit<
  TTable["$inferInsert"],
  GeneratedColumn
>;

/**
 * `createInsertSchema(table).omit({ id: true, createdAt: true })` does not
 * typecheck under drizzle-zod 0.8.3 + zod v4: BuildSchema returns
 * `z.ZodObject<Shape, { out: {}; in: {} }>`, and the empty out/in config
 * collapses the key union `.omit()` accepts to `never`, so each `true`
 * fails with TS2322. 0.8.3 is the newest stable release, so there is no
 * upgrade that fixes it.
 *
 * The runtime call is correct — only its emitted types are wrong — so the
 * omit is performed untyped and the result re-typed from the table's own
 * `$inferInsert`. Validation therefore stays derived from the table
 * definition: adding a column updates both the runtime schema and this
 * type automatically.
 */
export function insertSchemaFor<TTable extends Table>(table: TTable) {
  const schema = createInsertSchema(table) as unknown as z.ZodType;

  return (schema as z.ZodObject<z.ZodRawShape>).omit({
    id: true,
    createdAt: true,
  } as never) as unknown as z.ZodType<InsertShape<TTable>>;
}
