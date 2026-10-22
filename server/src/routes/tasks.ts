import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { createTaskSchema, updateTaskSchema } from "shared";

export const taskRouter = Router();

const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

taskRouter.get("/", async (req, res) => {
  const userTasks = await db.select().from(tasks).where(eq(tasks.userId, req.user!.id));

  res.status(200).json({ tasks: userTasks });
});

taskRouter.get("/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.user!.id)));

  if (!task) {
    return res.status(404).json({ error: "Task Does Not Exist" });
  }

  res.status(200).json({ task: task });
});

taskRouter.post("/", async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: z.treeifyError(parsed.error) });
  }

  const { title, description } = parsed.data;

  const dueDate: Date = parsed.data.dueDate ?? new Date(Date.now() + WEEK_IN_MILLISECONDS);

  const [newTask] = await db
    .insert(tasks)
    .values({
      title: title,
      dueDate: dueDate,
      description: description,
      userId: req.user!.id,
    })
    .returning();

  res.status(201).json({ task: newTask });
});

taskRouter.patch("/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: z.treeifyError(parsed.error) });
  }

  const updateValues: Partial<{
    title: string;
    description: string;
    completed: boolean;
    dueDate: Date;
  }> = {};

  if (parsed.data.title !== undefined) {
    updateValues.title = parsed.data.title;
  }
  if (parsed.data.description !== undefined) {
    updateValues.description = parsed.data.description;
  }

  if (parsed.data.dueDate !== undefined) {
    updateValues.dueDate = parsed.data.dueDate;
  }

  if (parsed.data.completed !== undefined) {
    updateValues.completed = parsed.data.completed;
  }

  if (Object.keys(updateValues).length === 0) {
    return res.status(400).json({ error: "Bad Request must update at least one parameter" });
  }

  const [updated] = await db
    .update(tasks)
    .set(updateValues)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.user!.id)))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Task Not Found" });
  }

  res.status(200).json({ task: updated });
});

taskRouter.delete("/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.user!.id)))
    .returning();

  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).end();
});
