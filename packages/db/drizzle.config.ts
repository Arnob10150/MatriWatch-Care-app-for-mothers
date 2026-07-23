import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or SUPABASE_DATABASE_URL must be set. Ensure the database is provisioned.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
