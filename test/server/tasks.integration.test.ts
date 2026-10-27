// Integration tests for the tasks API against a real Postgres test database.
// Skipped unless TEST_DATABASE_URL is set. See test/setup/db-integration.ts.
import { describe, it } from "vitest";
import { TEST_DATABASE_URL } from "../setup/db-integration";

describe.skipIf(!TEST_DATABASE_URL)("tasks API (integration)", () => {
  it.todo("creates, reads, updates and deletes a task");
  it.todo("does not return another user's tasks");
  it.todo("returns 401 without a session cookie");
});
