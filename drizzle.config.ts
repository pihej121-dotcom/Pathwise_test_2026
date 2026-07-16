import { defineConfig } from "drizzle-kit";

// For Supabase: use DIRECT_URL (direct connection, port 5432) for migrations.
// The pooled connection (DATABASE_URL, port 6543) does not support DDL statements.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DIRECT_URL (or DATABASE_URL) must be set to run migrations. " +
    "For Supabase, set DIRECT_URL to the direct (non-pooled) connection string."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});
