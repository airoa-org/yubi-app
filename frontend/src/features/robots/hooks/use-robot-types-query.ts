"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export interface RobotTypesFilterParams {
  site_id?: string;
  location_id?: string;
  status?: number;
}

export const robotTypesQueryKeys = {
  all: ["robot-types"] as const,
  list: (params?: RobotTypesFilterParams) =>
    [...robotTypesQueryKeys.all, "list", params ?? {}] as const,
};

export function useRobotTypesQuery(params?: RobotTypesFilterParams) {
  return useQuery({
    queryKey: robotTypesQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.site_id) searchParams.append("site_id", params.site_id);
      if (params?.location_id)
        searchParams.append("location_id", params.location_id);
      if (params?.status !== undefined)
        searchParams.append("status", String(params.status));
      const query = searchParams.toString();
      const response = await fetch(
        `/web/api/robot-types${query ? `?${query}` : ""}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch robot types: ${response.statusText}`);
      }
      const data = await response.json();
      return z.string().array().parse(data);
    },
  });
}
