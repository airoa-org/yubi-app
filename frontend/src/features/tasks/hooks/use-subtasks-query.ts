"use client";

import { useQuery } from "@tanstack/react-query";

import { schemas } from "@/lib/api/generated/api";

/**
 * Query Keys for SubTasks
 */
export const subtasksQueryKeys = {
  all: ["subtasks"] as const,
  lists: () => [...subtasksQueryKeys.all, "list"] as const,
  list: (taskId?: string) =>
    taskId
      ? [...subtasksQueryKeys.lists(), taskId]
      : [...subtasksQueryKeys.lists()],
  details: () => [...subtasksQueryKeys.all, "detail"] as const,
  detail: (subtaskId: string) =>
    [...subtasksQueryKeys.details(), subtaskId] as const,
};

/**
 * Hook to fetch subtasks for a specific task
 */
export function useSubTasksQuery(taskId?: string) {
  return useQuery({
    queryKey: subtasksQueryKeys.list(taskId),
    queryFn: async () => {
      const query = taskId ? `?task_id=${taskId}` : "";
      const response = await fetch(`/web/api/subtasks${query}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch subtasks: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.SubTask.array().parse(data);
    },
    enabled: !!taskId,
  });
}
