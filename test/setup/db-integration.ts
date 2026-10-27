// Helpers for integration tests against a real Postgres test database.
//
// Setup you need to do:
//   1. Create a separate database (e.g. taskapp_test) in the docker-compose
//      Postgres, and set TEST_DATABASE_URL to point at it.
//   2. server/src/db/index.ts reads process.env.DATABASE_URL at import time and
//      throws if it is missing. Before importing any server module in an
//      integration test, copy the test URL over:
//
//        process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
//        const { db } = await import("../../server/src/db/index.js");
//
// The integration suite is skipped when TEST_DATABASE_URL is not set.

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Apply migrations (server/drizzle) to the test database.
export async function migrateTestDb(): Promise<void> {
  throw new Error("migrateTestDb: not implemented");
}

// Delete all rows from users, sessions and tasks.
export async function truncateTestDb(): Promise<void> {
  throw new Error("truncateTestDb: not implemented");
}

// Close the connection pool so the test process can exit.
export async function closeTestDb(): Promise<void> {
  throw new Error("closeTestDb: not implemented");
}
