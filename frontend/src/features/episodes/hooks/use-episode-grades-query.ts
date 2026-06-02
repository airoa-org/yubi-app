"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { episodeGradeQueryKeys } from "./use-my-episode-grade-query";

type EpisodeGradeListResponse = z.infer<
  typeof schemas.EpisodeGradeListResponse
>;

export function useEpisodeGradesQuery(
  episodeId: string,
  page: number = 1,
  limit: number = 20,
  options?: { enabled?: boolean }
) {
  return useQuery<EpisodeGradeListResponse>({
    queryKey: episodeGradeQueryKeys.list(episodeId, page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const response = await fetch(
        `/web/api/episodes/${episodeId}/grades?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch episode grades: ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
  });
}
