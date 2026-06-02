"use client";

import { useQuery } from "@tanstack/react-query";

const ROBOT_SCOPE_URL = process.env.NEXT_PUBLIC_ROBOT_SCOPE_URL;

interface RobotScopeResponse {
  robots: Array<string | { id: string }>;
}

/**
 * Scope is permissive by default: if the endpoint is unreachable,
 * returns an error, or returns an empty list — all robots are allowed.
 */
export function useRobotScope(): {
  scopeIds: string[] | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery<string[] | null>({
    queryKey: ["robotScope"],
    queryFn: async () => {
      if (!ROBOT_SCOPE_URL) return null;

      const response = await fetch(ROBOT_SCOPE_URL);
      if (!response.ok) return null;

      const json: RobotScopeResponse = await response.json();
      if (!json.robots || json.robots.length === 0) return null;

      return json.robots.map((r) => (typeof r === "string" ? r : r.id));
    },
    enabled: !!ROBOT_SCOPE_URL,
    retry: false,
    staleTime: 30_000,
  });

  return {
    scopeIds: data ?? null,
    isLoading: !!ROBOT_SCOPE_URL && isLoading,
  };
}

/**
 * Returns true if the robot is allowed for teleoperation.
 * When scopeIds is null, all robots are allowed.
 */
export function isRobotInScope(
  robotId: string,
  scopeIds: string[] | null
): boolean {
  if (scopeIds === null) return true;
  return scopeIds.includes(robotId);
}
