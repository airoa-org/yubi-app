"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type SiteListResponse = z.infer<typeof schemas.SiteListResponse>;

export const sitesQueryKeys = {
  all: ["sites"] as const,
  lists: () => [...sitesQueryKeys.all, "list"] as const,
  list: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      organization_id?: string;
    } = {}
  ) => [...sitesQueryKeys.lists(), params] as const,
};

/**
 * Hook to fetch list of sites
 */
export function useSitesQuery(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    organization_id?: string;
  } = {},
  options?: Omit<
    UseQueryOptions<SiteListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: sitesQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) {
        searchParams.append("page", String(params.page));
      }
      if (params.limit !== undefined) {
        searchParams.append("limit", String(params.limit));
      }
      if (params.search) {
        searchParams.append("search", params.search);
      }
      if (params.organization_id) {
        searchParams.append("organization_id", params.organization_id);
      }
      const query = searchParams.toString();
      const response = await fetch(`/web/api/sites${query ? `?${query}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.SiteListResponse.parse(data);
    },
    ...options,
  });
}
