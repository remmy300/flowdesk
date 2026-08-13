"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, TaskDetail, TaskPriority, TaskStatus } from "@/lib/types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params?: Record<string, string | undefined>) =>
    [...taskKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};

export function useTasks(params?: { projectId?: string; status?: string; assigneeId?: string }) {
  const qs = new URLSearchParams();
  if (params?.projectId) qs.set("projectId", params.projectId);
  if (params?.status) qs.set("status", params.status);
  if (params?.assigneeId) qs.set("assigneeId", params.assigneeId);
  const query = qs.toString();

  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const { tasks } = await api<{ tasks: Task[] }>(`/tasks${query ? `?${query}` : ""}`);
      return tasks;
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const { task } = await api<{ task: TaskDetail }>(`/tasks/${id}`);
      return task;
    },
    enabled: !!id,
  });
}

export type TaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TaskInput) =>
      api<{ task: Task }>(`/projects/${projectId}/tasks`, { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TaskInput> }) =>
      api<{ task: Task }>(`/tasks/${id}`, { method: "PATCH", body }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
      api<{ task: Task }>(`/tasks/${id}/move`, {
        method: "POST",
        body: { status, position },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
