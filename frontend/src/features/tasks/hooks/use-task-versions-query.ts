"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { taskVersionSchema, type TaskVersion } from "../schemas";
import { tasksQueryKeys } from "./use-tasks-query";

export const taskVersionsQueryKeys = {
  versions: (taskId: string) =>
    [...tasksQueryKeys.detail(taskId), "versions"] as const,
};

export function useTaskVersionsQuery(
  taskId: string,
  options?: Omit<UseQueryOptions<TaskVersion[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: taskVersionsQueryKeys.versions(taskId),
    queryFn: async () => {
      const response = await fetch(`/web/api/tasks/${taskId}/versions`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch task versions: ${response.statusText}`
        );
      }
      const data = await response.json();
      return taskVersionSchema.array().parse(data);
    },
    enabled: !!taskId,
    ...options,
  });
}
