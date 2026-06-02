"use client";

import { useQuery } from "@tanstack/react-query";

import { taskTagSchema, taskCategoryTypeSchema } from "../schemas";

export const taskTagsQueryKeys = {
  all: ["task-tags"] as const,
  lists: () => [...taskTagsQueryKeys.all, "list"] as const,
  list: (categoryTypeId?: string) =>
    [...taskTagsQueryKeys.lists(), { categoryTypeId }] as const,
  categoryTypes: () => [...taskTagsQueryKeys.all, "category-types"] as const,
};

export function useTaskCategoryTypesQuery() {
  return useQuery({
    queryKey: taskTagsQueryKeys.categoryTypes(),
    queryFn: async () => {
      const response = await fetch("/web/api/task-category-types");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch task category types: ${response.statusText}`
        );
      }
      const data = await response.json();
      return taskCategoryTypeSchema.array().parse(data);
    },
  });
}

export function useTaskTagsQuery(categoryTypeId?: string) {
  return useQuery({
    queryKey: taskTagsQueryKeys.list(categoryTypeId),
    queryFn: async () => {
      const url = categoryTypeId
        ? `/web/api/task-tags?category_type_id=${categoryTypeId}`
        : "/web/api/task-tags";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch task tags: ${response.statusText}`);
      }
      const data = await response.json();
      return taskTagSchema.array().parse(data);
    },
  });
}
