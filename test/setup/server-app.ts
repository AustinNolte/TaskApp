// Express app for supertest that mirrors server/src/index.ts routing:
//   /api/tasks  ->  requireAuth  ->  taskRouter
// requireAuth is replaced by a stub that sets req.user, so route tests do not
// need a real session or database.
//
// Usage:
//   import request from "supertest";
//   import { createTestApp } from "../setup/server-app";
//   const app = createTestApp({ userId: "00000000-0000-0000-0000-000000000001" });
//   const res = await request(app).get("/api/tasks");
import express from "express";
import { taskRouter } from "../../server/src/routes/tasks.js";

export const TEST_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Test User",
  email: "test@example.com",
};

export type TestAppOptions = {
  userId?: string;
};

export const createTestApp = ({ userId = TEST_USER.id }: TestAppOptions = {}) => {
  const app = express();
  app.use(express.json());

  app.use(
    "/api/tasks",
    (req, _res, next) => {
      req.user = { ...TEST_USER, id: userId };
      next();
    },
    taskRouter,
  );

  return app;
};
