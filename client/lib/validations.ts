import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(80),
  description: z.string().trim().max(1000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional().nullable(),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;
export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
