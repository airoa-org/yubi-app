"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { subtasksByVersionQueryKeys } from "./use-subtasks-by-version-query";
import { subtasksQueryKeys } from "./use-subtasks-query";

type SubTaskUpdateInput = z.infer<typeof schemas.SubTaskUpdate>;

interface UpdateSubTaskParams {
  subtaskId: string;
  taskId: string;
  data: SubTaskUpdateInput;
}

/**
 * Hook to update a subtask
 */
export function useUpdateSubTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subtaskId, data }: UpdateSubTaskParams) => {
      const response = await fetch(`/web/api/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update subtask: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast.success("Subtask updated successfully");
      queryClient.invalidateQueries({
        queryKey: subtasksQueryKeys.list(variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: subtasksQueryKeys.detail(variables.subtaskId),
      });
      queryClient.invalidateQueries({
        queryKey: subtasksByVersionQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask");
    },
  });
}
