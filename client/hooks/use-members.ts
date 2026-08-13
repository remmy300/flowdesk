"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Membership, ProjectRole } from "@/lib/types";

export const memberKeys = {
  project: (projectId: string) => ["members", projectId] as const,
};

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: memberKeys.project(projectId),
    queryFn: async () => {
      const { members } = await api<{ members: Membership[] }>(
        `/projects/${projectId}/members`
      );
      return members;
    },
    enabled: !!projectId,
  });
}

export function useAddMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: ProjectRole }) =>
      api<{ member: Membership }>(`/projects/${projectId}/members`, {
        method: "POST",
        body: { email, role },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.project(projectId) });
    },
  });
}

export function useUpdateMemberRole(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProjectRole }) =>
      api<{ member: Membership }>(`/projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        body: { role },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.project(projectId) });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api<{ message: string }>(`/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.project(projectId) });
    },
  });
}
