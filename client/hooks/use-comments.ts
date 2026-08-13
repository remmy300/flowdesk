"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Comment } from "@/lib/types";

export const commentKeys = {
  task: (taskId: string) => ["comments", taskId] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.task(taskId),
    queryFn: async () => {
      const { comments } = await api<{ comments: Comment[] }>(`/tasks/${taskId}/comments`);
      return comments;
    },
    enabled: !!taskId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      api<{ comment: Comment }>(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: { content },
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: commentKeys.task(vars.taskId) });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, taskId }: { id: string; taskId: string }) =>
      api<{ message: string }>(`/comments/${id}`, { method: "DELETE" }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: commentKeys.task(vars.taskId) });
    },
  });
}
