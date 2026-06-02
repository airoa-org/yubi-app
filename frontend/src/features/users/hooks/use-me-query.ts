"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type UserResponse = z.infer<typeof schemas.UserResponse>;

export const meQueryKeys = {
  all: ["me"] as const,
  detail: () => [...meQueryKeys.all, "detail"] as const,
};

export function useMeQuery(
  options?: Omit<UseQueryOptions<UserResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<UserResponse, Error>({
    queryKey: meQueryKeys.detail(),
    queryFn: async () => {
      const response = await fetch("/web/api/me");
      if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.UserResponse.parse(data);
    },
    ...options,
  });
}
