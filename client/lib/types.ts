export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt?: string;
};

export type UserRole = "USER" | "ADMIN";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ProjectMember = {
  role: ProjectRole;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  members: ProjectMember[];
  taskCount: number;
  completedTaskCount: number;
  progress: number;
};

export type ProjectDetail = Project & {
  activityLogs: ActivityLog[];
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee: Pick<User, "id" | "name" | "avatarUrl"> | null;
  createdBy: Pick<User, "id" | "name" | "avatarUrl">;
  project?: { id: string; name: string; color: string };
};

export type TaskDetail = Task & {
  comments: Comment[];
  project: Task["project"] & { ownerId: string };
};

export type Comment = {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, "id" | "name" | "avatarUrl">;
};

export type ActivityLog = {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
};

export type Membership = {
  id: string;
  role: ProjectRole;
  createdAt: string;
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
};

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];
