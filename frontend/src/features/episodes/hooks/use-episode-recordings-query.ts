"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type EpisodeRecordingsResponse = z.infer<
  typeof schemas.EpisodeRecordingsResponse
>;

export const episodeRecordingsQueryKeys = {
  recordings: (episodeId: string) =>
    ["episodes", episodeId, "recordings"] as const,
};

export function useEpisodeRecordingsQuery(episodeId: string) {
  return useQuery<EpisodeRecordingsResponse, Error>({
    queryKey: episodeRecordingsQueryKeys.recordings(episodeId),
    queryFn: async () => {
      const response = await fetch(`/web/api/episodes/${episodeId}/recordings`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recordings: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.EpisodeRecordingsResponse.parse(data);
    },
    staleTime: 50 * 60 * 1000,
  });
}
