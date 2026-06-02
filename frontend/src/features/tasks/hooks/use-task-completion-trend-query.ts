"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type TaskCompletionTrend = z.infer<typeof schemas.TaskCompletionTrend>;

export const taskCompletionTrendQueryKeys = {
  all: ["taskCompletionTrend"] as const,
  list: (params: {
    group_by: string;
    robot_type?: string[];
    category_type_id?: string;
    tag_id?: string[];
    from?: string;
    to?: string;
    interval?: string;
  }) => [...taskCompletionTrendQueryKeys.all, params] as const,
};

export function useTaskCompletionTrendQuery(params: {
  group_by: string;
  robot_type?: string[];
  category_type_id?: string;
  tag_id?: string[];
  from?: string;
  to?: string;
  interval?: string;
}) {
  return useQuery({
    queryKey: taskCompletionTrendQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append("group_by", params.group_by);
      params.robot_type?.forEach((m) => searchParams.append("robot_type", m));
      if (params.category_type_id)
        searchParams.append("category_type_id", params.category_type_id);
      params.tag_id?.forEach((id) => searchParams.append("tag_id", id));
      if (params.from) searchParams.append("from", params.from);
      if (params.to) searchParams.append("to", params.to);
      if (params.interval) searchParams.append("interval", params.interval);
      const query = searchParams.toString();
      const url = `/web/api/tasks/completion-trend?${query}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch completion trend: ${response.statusText}`
        );
      }
      const data = await response.json();
      return schemas.TaskCompletionTrend.parse(data) as TaskCompletionTrend;
    },
  });
}
