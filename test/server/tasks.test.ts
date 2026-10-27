// Route tests for server/src/routes/tasks.ts using the mocked database.
import request from "supertest";
import { beforeEach, describe, it, vi } from "vitest";
import { resetMockDb } from "../setup/db-mock";
import { createTestApp } from "../setup/server-app";

// vi.mock is hoisted above imports, so the mock object must come from vi.hoisted.
const { hoistedDb } = await vi.hoisted(async () => ({
  hoistedDb: (await import("../setup/db-mock")).mockDb,
}));

vi.mock("../../server/src/db/index.js", () => ({ db: hoistedDb }));

beforeEach(() => {
  resetMockDb();
});

describe("GET /api/tasks", () => {
  it.todo("returns the current user's tasks");
});

describe("GET /api/tasks/:id", () => {
  it.todo("returns 400 for an invalid id");
  it.todo("returns 404 when the task does not exist");
  it.todo("returns 200 with the task");
});

describe("POST /api/tasks", () => {
  it.todo("returns 400 for an invalid body");
  it.todo("returns 201 with the created task");
});

describe("PATCH /api/tasks/:id", () => {
  it.todo("returns 400 when no updatable field is given");
  it.todo("returns 404 when the task does not exist");
  it.todo("returns 200 with the updated task");
});

describe("DELETE /api/tasks/:id", () => {
  it.todo("returns 404 when nothing is deleted");
  it.todo("returns 204 on success");
});
