"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { type TaskVersion } from "../schemas";
import { tasksQueryKeys } from "./use-tasks-query";

type TaskVersionCreateInput = z.infer<typeof schemas.TaskVersionCreate>;

export function useCreateTaskVersionMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<TaskVersion, Error, TaskVersionCreateInput>({
    mutationFn: async (data: TaskVersionCreateInput) => {
      const payload = schemas.TaskVersionCreate.parse(data);
      const response = await fetch(`/web/api/tasks/${taskId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error("A version with this name already exists");
        }
        throw new Error(
          errorData.error ||
            `Failed to create task version: ${response.statusText}`
        );
      }
      const result = await response.json();
      return schemas.TaskVersion.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKeys.detail(taskId),
      });
      toast.success("Task version created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create task version", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
