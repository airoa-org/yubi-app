"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  taskTagSchema,
  taskTagCreateSchema,
  type TaskTag,
  type TaskTagCreate,
} from "../schemas";
import { taskTagsQueryKeys } from "./use-task-tags-query";

export function useCreateTaskTagMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskTag, Error, TaskTagCreate>({
    mutationFn: async (data: TaskTagCreate) => {
      const payload = taskTagCreateSchema.parse(data);
      const response = await fetch("/web/api/task-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to create task tag: ${response.statusText}`);
      }
      const created = await response.json();
      return taskTagSchema.parse(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskTagsQueryKeys.lists() });
      toast.success("Tag created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create tag", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
