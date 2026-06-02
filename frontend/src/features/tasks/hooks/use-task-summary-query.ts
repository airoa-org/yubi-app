"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type TaskSummaryResponse = z.infer<typeof schemas.TaskSummaryResponse>;

export const taskSummaryQueryKeys = {
  all: ["taskSummary"] as const,
  list: (params?: {
    robot_type?: string[];
    category_type_id?: string;
    tag_id?: string[];
    from?: string;
    to?: string;
  }) => [...taskSummaryQueryKeys.all, params] as const,
};

export function useTaskSummaryQuery(params?: {
  robot_type?: string[];
  category_type_id?: string;
  tag_id?: string[];
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: taskSummaryQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      params?.robot_type?.forEach((m) => searchParams.append("robot_type", m));
      if (params?.category_type_id)
        searchParams.append("category_type_id", params.category_type_id);
      params?.tag_id?.forEach((id) => searchParams.append("tag_id", id));
      if (params?.from) searchParams.append("from", params.from);
      if (params?.to) searchParams.append("to", params.to);
      const query = searchParams.toString();
      const url = `/web/api/tasks/summary${query ? `?${query}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch task summary: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.TaskSummaryResponse.parse(data) as TaskSummaryResponse;
    },
  });
}
