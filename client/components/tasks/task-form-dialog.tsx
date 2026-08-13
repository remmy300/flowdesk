"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { taskFormSchema, type TaskFormInput } from "@/lib/validations";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useMembers } from "@/hooks/use-members";
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/common/loader";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: Task["status"];
  task?: Task | null;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus,
  task,
}: TaskFormDialogProps) {
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask();
  const { data: members = [] } = useMembers(projectId);
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: "",
      dueDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        status: task?.status ?? defaultStatus ?? "TODO",
        priority: task?.priority ?? "MEDIUM",
        assigneeId: task?.assigneeId ?? "",
        dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      });
    }
  }, [open, task, defaultStatus, reset]);

  const onSubmit = async (values: TaskFormInput) => {
    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          body: {
            title: values.title,
            description: values.description || null,
            status: values.status,
            priority: values.priority,
            assigneeId: values.assigneeId || null,
            dueDate: values.dueDate ?? null,
          },
        });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          status: values.status,
          priority: values.priority,
          assigneeId: values.assigneeId || undefined,
          dueDate: values.dueDate ?? undefined,
        });
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch {
      // toast handled by query client default
    }
  };

  const submitting = isSubmitting || createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Describe what needs to be done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="Ship the landing page" autoFocus {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" rows={3} placeholder="Add more context..." {...register("description")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as TaskFormInput["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) => setValue("priority", v as TaskFormInput["priority"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select
                value={watch("assigneeId") ?? ""}
                onValueChange={(v) => setValue("assigneeId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Due date</Label>
              <Input
                type="date"
                value={watch("dueDate") ? new Date(watch("dueDate")!).toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  setValue("dueDate", e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner />}
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
