"use client";

import { CalendarClock, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  commentCount?: number;
};

export function TaskCard({ task, onOpen, onDragStart, onDragEnd, commentCount }: TaskCardProps) {
  const overdue =
    task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== "DONE";

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      className="cursor-pointer p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate ? (
            <span
              className={`flex items-center gap-1 text-xs ${
                overdue ? "font-medium text-destructive" : "text-muted-foreground"
              }`}
            >
              <CalendarClock className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          ) : null}
          {commentCount ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          ) : null}
        </div>
        {task.assignee ? (
          <UserAvatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} className="h-6 w-6" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed text-muted-foreground">
            <span className="text-[9px]">—</span>
          </div>
        )}
      </div>
    </Card>
  );
}
