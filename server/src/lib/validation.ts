import { z } from "zod";

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Google credential is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
  }),
});

export const projectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required").max(80),
    description: z.string().trim().max(1000).optional().nullable(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  }),
});

export const projectParams = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid project id" }),
  }),
});

export const projectIdParams = z.object({
  params: z.object({
    projectId: z.string().cuid({ message: "Invalid project id" }),
  }),
});

export const taskIdParams = z.object({
  params: z.object({
    taskId: z.string().cuid({ message: "Invalid task id" }),
  }),
});

export const taskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Task title is required").max(200),
    description: z.string().trim().max(5000).optional().nullable(),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    assigneeId: z.string().cuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    position: z.number().int().optional(),
  }),
});

export const taskParams = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid task id" }),
  }),
});

export const taskMoveSchema = z.object({
  body: z.object({
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
    position: z.number().int().min(0),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
  }),
});

export const memberSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email").toLowerCase(),
    role: z.enum(["MEMBER", "ADMIN"]).optional(),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(["MEMBER", "ADMIN"]),
  }),
});

export const memberParams = z.object({
  params: z.object({
    projectId: z.string().cuid({ message: "Invalid project id" }),
    userId: z.string().cuid({ message: "Invalid user id" }),
  }),
});
