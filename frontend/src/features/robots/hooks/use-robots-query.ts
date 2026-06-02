"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

export const robotsQueryKeys = {
  all: ["robots"] as const,
  lists: () => [...robotsQueryKeys.all, "list"] as const,
  list: (
    params: {
      site_id?: string;
      location_id?: string;
      status?: 0 | 1 | 2 | 3 | 4;
      robot_type?: string;
      page?: number;
      limit?: number;
      search?: string;
      sort_by?: string;
      sort_order?: string;
    } = {}
  ) => [...robotsQueryKeys.lists(), params] as const,
  details: () => [...robotsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...robotsQueryKeys.details(), id] as const,
};

type Robot = z.infer<typeof schemas.Robot>;
type RobotListResponse = z.infer<typeof schemas.RobotListResponse>;

function normalizeRobot(robot: unknown): unknown {
  if (typeof robot !== "object" || robot === null) return robot;
  return {
    ...(robot as Record<string, unknown>),
    robot_config:
      (robot as Record<string, unknown>).robot_config === null
        ? undefined
        : (robot as Record<string, unknown>).robot_config,
  };
}

export function useRobotsQuery(
  params: {
    site_id?: string;
    location_id?: string;
    status?: 0 | 1 | 2 | 3 | 4;
    robot_type?: string;
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  } = {},
  options?: Omit<
    UseQueryOptions<RobotListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: robotsQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.site_id) {
        searchParams.append("site_id", params.site_id);
      }
      if (params.location_id) {
        searchParams.append("location_id", params.location_id);
      }
      if (params.status !== undefined) {
        searchParams.append("status", String(params.status));
      }
      if (params.robot_type) {
        searchParams.append("robot_type", params.robot_type);
      }
      if (params.page !== undefined) {
        searchParams.append("page", String(params.page));
      }
      if (params.limit !== undefined) {
        searchParams.append("limit", String(params.limit));
      }
      if (params.search) {
        searchParams.append("search", params.search);
      }
      if (params.sort_by) {
        searchParams.append("sort_by", params.sort_by);
      }
      if (params.sort_order) {
        searchParams.append("sort_order", params.sort_order);
      }
      const query = searchParams.toString();
      const url = `/web/api/robots${query ? `?${query}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch robots: ${response.statusText}`);
      }
      const data = await response.json();
      const normalized = {
        ...data,
        robots: (data.robots || []).map(normalizeRobot),
      };
      return schemas.RobotListResponse.parse(normalized);
    },
    ...options,
  });
}

export function useRobotQuery(
  robotId: string,
  options?: Omit<UseQueryOptions<Robot, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: robotsQueryKeys.detail(robotId),
    queryFn: async () => {
      const response = await fetch(`/web/api/robots/${robotId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch robot: ${response.statusText}`);
      }
      const data = await response.json();
      const normalized = normalizeRobot(data);
      return schemas.Robot.parse(normalized);
    },
    enabled: !!robotId,
    staleTime: 0,
    refetchOnMount: "always",
    ...options,
  });
}
