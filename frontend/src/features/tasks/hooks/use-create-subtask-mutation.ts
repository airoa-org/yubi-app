"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { subtasksByVersionQueryKeys } from "./use-subtasks-by-version-query";
import { subtasksQueryKeys } from "./use-subtasks-query";

type SubTaskCreateInput = z.infer<typeof schemas.SubTaskCreate>;

/**
 * Hook to create a new subtask
 */
export function useCreateSubTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubTaskCreateInput) => {
      const response = await fetch("/web/api/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create subtask: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast.success("Subtask created successfully");
      queryClient.invalidateQueries({
        queryKey: subtasksQueryKeys.list(variables.task_id),
      });
      queryClient.invalidateQueries({
        queryKey: subtasksByVersionQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Failed to create subtask:", error);
      toast.error("Failed to create subtask");
    },
  });
}
