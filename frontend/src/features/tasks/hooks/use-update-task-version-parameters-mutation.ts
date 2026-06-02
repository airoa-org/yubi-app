"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { schemas } from "@/lib/api/generated/api";

import { type TaskVersion } from "../schemas";
import { taskVersionsQueryKeys } from "./use-task-versions-query";

interface UpdateTaskVersionParametersInput {
  versionId: string;
  parameters: { key: string; values: string[] }[];
}

export function useUpdateTaskVersionParametersMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<TaskVersion, Error, UpdateTaskVersionParametersInput>({
    mutationFn: async ({ versionId, parameters }) => {
      const response = await fetch(
        `/web/api/tasks/${taskId}/versions/${versionId}/parameters`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parameters }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error("Cannot update parameters on an approved version");
        }
        throw new Error(
          errorData.error ||
            `Failed to update parameters: ${response.statusText}`
        );
      }
      const result = await response.json();
      return schemas.TaskVersion.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskVersionsQueryKeys.versions(taskId),
      });
      toast.success("Parameters updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update parameters", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
