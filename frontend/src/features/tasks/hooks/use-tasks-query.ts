"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { taskSchema, type Task } from "../schemas";

type TaskListResponse = z.infer<typeof schemas.TaskListResponse>;

export const tasksQueryKeys = {
  all: ["tasks"] as const,
  lists: () => [...tasksQueryKeys.all, "list"] as const,
  list: (params?: {
    has_approved_version?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
    status?: number[];
    priority?: number[];
    difficulty?: number[];
    robot_type?: string;
    search?: string;
  }) => [...tasksQueryKeys.lists(), params] as const,
  details: () => [...tasksQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...tasksQueryKeys.details(), id] as const,
};

export function useTasksQuery(
  params?: {
    has_approved_version?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
    status?: number[];
    priority?: number[];
    difficulty?: number[];
    robot_type?: string;
    search?: string;
  },
  options?: Omit<
    UseQueryOptions<TaskListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: tasksQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.has_approved_version) {
        searchParams.append("has_approved_version", "true");
      }
      if (params?.page !== undefined) {
        searchParams.append("page", String(params.page));
      }
      if (params?.limit !== undefined) {
        searchParams.append("limit", String(params.limit));
      }
      if (params?.sort_by) {
        searchParams.append("sort_by", params.sort_by);
      }
      if (params?.sort_order) {
        searchParams.append("sort_order", params.sort_order);
      }
      params?.status?.forEach((s) => searchParams.append("status", String(s)));
      params?.priority?.forEach((p) =>
        searchParams.append("priority", String(p))
      );
      params?.difficulty?.forEach((d) =>
        searchParams.append("difficulty", String(d))
      );
      if (params?.robot_type) {
        searchParams.append("robot_type", params.robot_type);
      }
      if (params?.search) {
        searchParams.append("search", params.search);
      }
      const query = searchParams.toString();
      const url = `/web/api/tasks${query ? `?${query}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.TaskListResponse.parse(data);
    },
    ...options,
  });
}

type GetTaskResponse = Task;

export function useTaskQuery(
  taskId: string,
  options?: Omit<
    UseQueryOptions<GetTaskResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: tasksQueryKeys.detail(taskId),
    queryFn: async () => {
      const response = await fetch(`/web/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.statusText}`);
      }
      const data = await response.json();
      return taskSchema.parse(data);
    },
    enabled: !!taskId,
    ...options,
  });
}
