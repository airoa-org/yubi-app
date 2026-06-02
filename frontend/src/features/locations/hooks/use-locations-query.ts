"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type Location = z.infer<typeof schemas.Location>;
type LocationListResponse = z.infer<typeof schemas.LocationListResponse>;

export const locationsQueryKeys = {
  all: ["locations"] as const,
  lists: () => [...locationsQueryKeys.all, "list"] as const,
  list: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      site_id?: string;
      sort_by?: string;
      sort_order?: string;
    } = {}
  ) => [...locationsQueryKeys.lists(), params] as const,
  details: () => [...locationsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...locationsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch list of locations
 */
export function useLocationsQuery(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    site_id?: string;
    sort_by?: string;
    sort_order?: string;
  } = {},
  options?: Omit<
    UseQueryOptions<LocationListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: locationsQueryKeys.list(params),
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
      if (params.site_id) {
        searchParams.append("site_id", params.site_id);
      }
      if (params.sort_by) {
        searchParams.append("sort_by", params.sort_by);
      }
      if (params.sort_order) {
        searchParams.append("sort_order", params.sort_order);
      }
      const query = searchParams.toString();
      const response = await fetch(
        `/web/api/locations${query ? `?${query}` : ""}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.LocationListResponse.parse(data);
    },
    ...options,
  });
}

/**
 * Hook to fetch a single location by ID
 */
export function useLocationQuery(
  locationId: string,
  options?: Omit<UseQueryOptions<Location, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: locationsQueryKeys.detail(locationId),
    queryFn: async () => {
      const response = await fetch(`/web/api/locations/${locationId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch location: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.Location.parse(data);
    },
    enabled: !!locationId,
    ...options,
  });
}
