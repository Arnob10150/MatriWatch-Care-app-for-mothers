import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const needsSsl =
  process.env.DATABASE_SSL === "true" ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com");

export const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
