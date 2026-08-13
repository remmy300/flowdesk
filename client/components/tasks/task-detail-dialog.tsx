"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Pencil, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useMembers } from "@/hooks/use-members";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/user-avatar";
import { Spinner } from "@/components/common/loader";
import { CommentSection } from "./comment-section";
import { TaskFormDialog } from "./task-form-dialog";

type TaskDetailDialogProps = {
  task: Task | null;
  onClose: () => void;
};

export function TaskDetailDialog({ task, onClose }: TaskDetailDialogProps) {
  const router = useRouter();
  const { data: detail } = useTask(task?.id ?? "");
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: members = [] } = useMembers(task?.projectId ?? "");
  const [editing, setEditing] = useState(false);

  const current = detail ?? task;

  const update = (body: Parameters<typeof updateTask.mutateAsync>[0]["body"]) => {
    if (!current) return;
    updateTask.mutateAsync({ id: current.id, body }).then(() => toast.success("Task updated"));
  };

  const handleDelete = async () => {
    if (!current) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask.mutateAsync(current.id);
    toast.success("Task deleted");
    onClose();
  };

  return (
    <>
      <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          {!current ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <>
              <DialogHeader className="flex-row items-start justify-between gap-4">
                <DialogTitle className="text-xl">{current.title}</DialogTitle>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={current.status}
                    onValueChange={(v) => update({ status: v as TaskStatus })}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={current.priority}
                    onValueChange={(v) => update({ priority: v as Task["priority"] })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={current.assigneeId ?? ""}
                    onValueChange={(v) => update({ assigneeId: v || null })}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <span className="flex items-center gap-2">
                          <UserRound className="h-3.5 w-3.5" /> Unassigned
                        </span>
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>
                          <span className="flex items-center gap-2">
                            <UserAvatar
                              name={m.user.name}
                              avatarUrl={m.user.avatarUrl}
                              className="h-4 w-4"
                            />
                            {m.user.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {current.description && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {current.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    Due {formatDate(current.dueDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserRound className="h-4 w-4" />
                    Created by {current.createdBy.name}
                  </span>
                  {current.project && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                      onClose();
                      router.push(`/projects/${current.project!.id}`);
                    }}>
                      {current.project.name}
                    </Badge>
                  )}
                </div>

                <Separator />

                <CommentSection taskId={current.id} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {current && (
        <TaskFormDialog
          open={editing}
          onOpenChange={setEditing}
          projectId={current.projectId}
          task={current}
        />
      )}
    </>
  );
}
