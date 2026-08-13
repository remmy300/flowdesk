"use client";

import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Something went wrong";
          toast.error(message);
        },
      },
    },
  });
}
