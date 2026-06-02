"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { subtasksByVersionQueryKeys } from "./use-subtasks-by-version-query";
import { subtasksQueryKeys } from "./use-subtasks-query";

interface ReorderSubTasksInput {
  taskVersionId: string;
  subtaskIds: string[];
  taskId: string;
}

export function useReorderSubTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderSubTasksInput) => {
      const response = await fetch("/web/api/subtasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_version_id: data.taskVersionId,
          subtask_ids: data.subtaskIds,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to reorder subtasks: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: subtasksQueryKeys.list(variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: subtasksByVersionQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Failed to reorder subtasks:", error);
      toast.error("Failed to reorder subtasks");
    },
  });
}
