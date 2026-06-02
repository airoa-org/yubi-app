"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type OrganizationResponse = z.infer<typeof schemas.OrganizationResponse>;

export const organizationsQueryKeys = {
  all: ["organizations"] as const,
  details: () => [...organizationsQueryKeys.all, "detail"] as const,
  detail: (organizationId: string) =>
    [...organizationsQueryKeys.details(), organizationId] as const,
};

/**
 * Hook to fetch a single organization by ID
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useOrganizationQuery("org-id-123");
 * ```
 */
export function useOrganizationQuery(
  organizationId: string,
  options?: Omit<
    UseQueryOptions<OrganizationResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: organizationsQueryKeys.detail(organizationId),
    queryFn: async () => {
      const response = await fetch(`/web/api/organizations/${organizationId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organization: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.OrganizationResponse.parse(data);
    },
    enabled: !!organizationId,
    ...options,
  });
}
