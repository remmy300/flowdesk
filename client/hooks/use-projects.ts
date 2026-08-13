"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project, ProjectDetail } from "@/lib/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const { projects } = await api<{ projects: Project[] }>("/projects");
      return projects;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { project } = await api<{ project: ProjectDetail }>(`/projects/${id}`);
      return project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; color?: string }) =>
      api<{ project: Project }>("/projects", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<{ name: string; description: string | null; color: string; status: string }>;
    }) => api<{ project: Project }>(`/projects/${id}`, { method: "PATCH", body }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
