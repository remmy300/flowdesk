"use client";

import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/lib/env";

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Upload failed");
      }
      return res.json() as Promise<{ url: string; publicId: string }>;
    },
  });
}
