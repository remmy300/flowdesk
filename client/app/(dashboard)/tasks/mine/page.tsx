"use client";

import { useState } from "react";
import { ListTodo } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/components/providers/auth-context";
import { TasksList } from "@/components/tasks/tasks-list";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyTasksPage() {
  const { user } = useAuth();
  const { data: myTasks = [], isLoading } = useTasks({ assigneeId: user?.id });
  const { data: projects = [] } = useProjects();
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<string>("ALL");
  const [projectId, setProjectId] = useState<string>("ALL");

  const filtered = myTasks.filter(
    (t) =>
      (status === "ALL" || t.status === status) &&
      (projectId === "ALL" || t.projectId === projectId)
  );

  const todo = myTasks.filter((t) => t.status === "TODO").length;
  const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const inReview = myTasks.filter((t) => t.status === "IN_REVIEW").length;
  const done = myTasks.filter((t) => t.status === "DONE").length;

  const statusCounts: Record<string, number> = {
    BACKLOG: myTasks.filter((t) => t.status === "BACKLOG").length,
    TODO: todo,
    IN_PROGRESS: inProgress,
    IN_REVIEW: inReview,
    DONE: done,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My tasks</h1>
        <p className="text-sm text-muted-foreground">Tasks assigned to you.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TASK_STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatus(status === value ? "ALL" : value)}
            className={
              status === value
                ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
            }
          >
            {label} · {statusCounts[value]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{filtered.length} tasks</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <TasksList tasks={filtered} onOpen={setOpenTask} />
      )}

      <TaskDetailDialog task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}
