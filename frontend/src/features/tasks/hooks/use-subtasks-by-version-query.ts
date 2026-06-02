"use client";

import { useQuery } from "@tanstack/react-query";

import { schemas } from "@/lib/api/generated/api";

export const subtasksByVersionQueryKeys = {
  all: ["subtasks-by-version"] as const,
  list: (taskVersionId: string) =>
    [...subtasksByVersionQueryKeys.all, taskVersionId] as const,
};

export function useSubTasksByVersionQuery(taskVersionId: string | undefined) {
  return useQuery({
    queryKey: subtasksByVersionQueryKeys.list(taskVersionId ?? ""),
    queryFn: async () => {
      const response = await fetch(
        `/web/api/subtasks?task_version_id=${taskVersionId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch subtasks: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.SubTask.array().parse(data);
    },
    enabled: !!taskVersionId,
  });
}
