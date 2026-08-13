"use client";

import { CalendarClock, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

type TasksListProps = {
  tasks: Task[];
  onOpen: (task: Task) => void;
  showProject?: boolean;
};

export function TasksList({ tasks, onOpen, showProject = true }: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">No tasks found.</Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => {
        const overdue =
          task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== "DONE";
        return (
          <Card
            key={task.id}
            className="cursor-pointer p-3 transition-shadow hover:shadow-md"
            onClick={() => onOpen(task)}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  {showProject && task.project && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                      />
                      {task.project.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      overdue ? "font-medium text-destructive" : "text-muted-foreground"
                    )}
                  >
                    <CalendarClock className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                {task.assignee ? (
                  <UserAvatar
                    name={task.assignee.name}
                    avatarUrl={task.assignee.avatarUrl}
                    className="h-6 w-6"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
