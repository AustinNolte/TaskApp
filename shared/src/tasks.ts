import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(24),
  description: z.string().min(1).max(255),
  dueDate: z.iso
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(24).optional(),
  description: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
  dueDate: z.iso
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
