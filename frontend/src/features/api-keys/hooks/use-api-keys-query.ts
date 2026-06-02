"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type ApiKeyListResponse = z.infer<typeof schemas.ApiKeyListResponse>;

export interface ListApiKeysParams {
  page?: number;
  limit?: number;
  robotId?: string;
  userId?: string;
  includeRevoked?: boolean;
}

export const apiKeysQueryKeys = {
  all: ["api-keys"] as const,
  lists: () => [...apiKeysQueryKeys.all, "list"] as const,
  list: (params: ListApiKeysParams = {}) =>
    [...apiKeysQueryKeys.lists(), params] as const,
  details: () => [...apiKeysQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...apiKeysQueryKeys.details(), id] as const,
};

export function useApiKeysQuery(
  params: ListApiKeysParams = {},
  options?: Omit<
    UseQueryOptions<ApiKeyListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<ApiKeyListResponse, Error>({
    queryKey: apiKeysQueryKeys.list(params),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.robotId) query.set("robot_id", params.robotId);
      if (params.userId) query.set("user_id", params.userId);
      if (params.includeRevoked) query.set("include_revoked", "true");

      const qs = query.toString();
      const response = await fetch(`/web/api/api-keys${qs ? `?${qs}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch api keys: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.ApiKeyListResponse.parse(data);
    },
    ...options,
  });
}
