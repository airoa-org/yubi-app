"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { type TaskVersion } from "../schemas";
import { taskVersionsQueryKeys } from "./use-task-versions-query";

type TaskVersionUpdateInput = z.infer<typeof schemas.TaskVersionUpdate>;

interface UpdateTaskVersionParams {
  taskId: string;
  versionId: string;
  data: TaskVersionUpdateInput;
}

export function useUpdateTaskVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskVersion, Error, UpdateTaskVersionParams>({
    mutationFn: async ({ taskId, versionId, data }) => {
      const response = await fetch(
        `/web/api/tasks/${taskId}/versions/${versionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to update task version: ${response.statusText}`
        );
      }
      const result = await response.json();
      return schemas.TaskVersion.parse(result);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskVersionsQueryKeys.versions(variables.taskId),
      });
      toast.success("Task version updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update task version", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
