"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { useTasks, useMoveTask } from "@/hooks/use-tasks";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type KanbanBoardProps = {
  projectId: string;
  onOpenTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
};

const columnStyles: Record<TaskStatus, string> = {
  BACKLOG: "border-muted",
  TODO: "border-muted",
  IN_PROGRESS: "border-blue-200",
  IN_REVIEW: "border-amber-200",
  DONE: "border-emerald-200",
};

const columnDot: Record<TaskStatus, string> = {
  BACKLOG: "bg-muted-foreground/50",
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-amber-500",
  DONE: "bg-emerald-500",
};

export function KanbanBoard({ projectId, onOpenTask, onCreateTask }: KanbanBoardProps) {
  const { data: tasks = [], isLoading } = useTasks({ projectId });
  const moveTask = useMoveTask();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const grouped = TASK_STATUSES.map(({ value }) => ({
    status: value,
    tasks: tasks.filter((t) => t.status === value).sort((a, b) => a.position - b.position),
  }));

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      moveTask.mutate(
        { id: draggedTask.id, status, position: grouped.find((g) => g.status === status)!.tasks.length },
        {
          onError: () => toast.error("Could not move task"),
        }
      );
    }
    setDraggedTask(null);
    setDragOverStatus(null);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {grouped.map(({ status, tasks: columnTasks }) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStatus(status);
          }}
          onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
          onDrop={() => handleDrop(status)}
          className={cn(
            "flex min-h-[240px] flex-col rounded-xl border-2 bg-muted/40 transition-colors",
            columnStyles[status],
            dragOverStatus === status && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", columnDot[status])} />
              <span className="text-sm font-semibold">
                {TASK_STATUSES.find((s) => s.value === status)?.label}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onCreateTask(status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 px-2 pb-2">
            {columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpenTask}
                onDragStart={setDraggedTask}
                onDragEnd={() => {
                  setDraggedTask(null);
                  setDragOverStatus(null);
                }}
              />
            ))}
            {isLoading && <div className="h-20 animate-pulse rounded-lg bg-muted" />}
            {!isLoading && columnTasks.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
