"use client";

import { useQuery } from "@tanstack/react-query";

import { taskTagSchema } from "../schemas";

export const taskAvailableTagsQueryKeys = {
  all: ["taskAvailableTags"] as const,
  list: (params?: { robot_type?: string[]; category_type_id?: string }) =>
    [...taskAvailableTagsQueryKeys.all, params] as const,
};

export function useTaskAvailableTagsQuery(params?: {
  robot_type?: string[];
  category_type_id?: string;
}) {
  return useQuery({
    queryKey: taskAvailableTagsQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      params?.robot_type?.forEach((m) => searchParams.append("robot_type", m));
      if (params?.category_type_id)
        searchParams.append("category_type_id", params.category_type_id);
      const query = searchParams.toString();
      const url = `/web/api/tasks/available-tags${query ? `?${query}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch available tags: ${response.statusText}`
        );
      }
      const data = await response.json();
      return taskTagSchema.array().parse(data);
    },
  });
}
