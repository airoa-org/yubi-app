"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

type EpisodeGrade = z.infer<typeof schemas.EpisodeGrade>;

export const episodeGradeQueryKeys = {
  all: ["episode-grades"] as const,
  my: (episodeId: string) =>
    [...episodeGradeQueryKeys.all, "my", episodeId] as const,
  lists: (episodeId: string) =>
    [...episodeGradeQueryKeys.all, "list", episodeId] as const,
  list: (episodeId: string, page: number, limit: number) =>
    [...episodeGradeQueryKeys.lists(episodeId), { page, limit }] as const,
};

/**
 * Fetches the current user's grade for an episode.
 * Resolves to `null` when the user has not graded the episode yet (backend 404).
 */
export function useMyEpisodeGradeQuery(
  episodeId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<EpisodeGrade | null>({
    queryKey: episodeGradeQueryKeys.my(episodeId),
    queryFn: async () => {
      const response = await fetch(`/web/api/episodes/${episodeId}/grades/me`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(
          `Failed to fetch my episode grade: ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
  });
}
