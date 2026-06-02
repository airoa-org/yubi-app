"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { subtasksByVersionQueryKeys } from "./use-subtasks-by-version-query";
import { subtasksQueryKeys } from "./use-subtasks-query";

interface DeleteSubTaskParams {
  subtaskId: string;
  taskId: string;
}

/**
 * Hook to delete a subtask
 */
export function useDeleteSubTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subtaskId }: DeleteSubTaskParams) => {
      const response = await fetch(`/web/api/subtasks/${subtaskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete subtask: ${response.statusText}`);
      }
    },
    onSuccess: (_data, variables) => {
      toast.success("Subtask deleted successfully");
      queryClient.invalidateQueries({
        queryKey: subtasksQueryKeys.list(variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: subtasksByVersionQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Failed to delete subtask:", error);
      toast.error("Failed to delete subtask");
    },
  });
}
