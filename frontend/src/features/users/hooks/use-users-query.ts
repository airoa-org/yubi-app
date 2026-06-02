"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type UserResponse = z.infer<typeof schemas.UserResponse>;
type UserListResponse = z.infer<typeof schemas.UserListResponse>;

/**
 * Query parameters for listing users
 */
interface ListUsersParams {
  page?: number;
  limit?: number;
  location_id?: string;
  site_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: (params: ListUsersParams = {}) =>
    [...usersQueryKeys.lists(), params] as const,
  details: () => [...usersQueryKeys.all, "detail"] as const,
  detail: (userId: string) => [...usersQueryKeys.details(), userId] as const,
};

export function useUsersQuery(
  params: ListUsersParams = {},
  options?: Omit<
    UseQueryOptions<UserListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<UserListResponse, Error>({
    queryKey: usersQueryKeys.list(params),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.location_id) query.set("location_id", params.location_id);
      if (params.site_id) query.set("site_id", params.site_id);
      if (params.search) query.set("search", params.search);
      if (params.sort_by) query.set("sort_by", params.sort_by);
      if (params.sort_order) query.set("sort_order", params.sort_order);
      const qs = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`/web/api/users${qs}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.UserListResponse.parse(data);
    },
    ...options,
  });
}

export function useUserQuery(
  userId: string,
  options?: Omit<UseQueryOptions<UserResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<UserResponse, Error>({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: async () => {
      const response = await fetch(`/web/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.UserResponse.parse(data);
    },
    enabled: !!userId,
    ...options,
  });
}
