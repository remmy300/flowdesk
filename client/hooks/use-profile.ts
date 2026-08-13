"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (body: { name?: string; avatarUrl?: string }) =>
      api<{ user: User }>("/users/profile", { method: "PATCH", body }),
  });
}
