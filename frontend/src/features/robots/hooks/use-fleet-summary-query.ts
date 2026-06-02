"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import type { FleetSiteSummary } from "../schemas/fleet";

export const fleetSummaryQueryKeys = {
  all: ["fleetSummary"] as const,
  lists: () => [...fleetSummaryQueryKeys.all, "list"] as const,
  list: () => [...fleetSummaryQueryKeys.lists()] as const,
};

/**
 * Fetch fleet summary data (site × robot type donut charts).
 * Real-time aggregation — no date range filtering.
 */
export function useFleetSummaryQuery(
  options?: Omit<
    UseQueryOptions<FleetSiteSummary[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: fleetSummaryQueryKeys.list(),
    queryFn: async (): Promise<FleetSiteSummary[]> => {
      const response = await fetch("/web/api/fleet/summary");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch fleet summary: ${response.statusText}`
        );
      }
      return response.json();
    },
    refetchInterval: 30_000,
    ...options,
  });
}
