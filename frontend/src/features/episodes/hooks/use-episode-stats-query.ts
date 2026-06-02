"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type EpisodeStatsResponse = z.infer<typeof schemas.EpisodeStatsResponse>;

export const episodeStatsQueryKeys = {
  stats: (episodeId: string) => ["episodes", episodeId, "stats"] as const,
};

export function useEpisodeStatsQuery(episodeId: string) {
  return useQuery<EpisodeStatsResponse, Error>({
    queryKey: episodeStatsQueryKeys.stats(episodeId),
    queryFn: async () => {
      const response = await fetch(`/web/api/episodes/${episodeId}/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.EpisodeStatsResponse.parse(data);
    },
  });
}
