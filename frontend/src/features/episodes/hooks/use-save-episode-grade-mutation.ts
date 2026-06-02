"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { episodesQueryKeys } from "./use-episodes-query";
import { episodeGradeQueryKeys } from "./use-my-episode-grade-query";

type EpisodeGrade = z.infer<typeof schemas.EpisodeGrade>;
type EpisodeGradeUpdate = z.infer<typeof schemas.EpisodeGradeUpdate>;

/**
 * Upserts the current user's grade for an episode.
 * On success, invalidates episode list/detail (so the new average/count is
 * fetched) and the my-grade query (so the edit dialog prefill picks up
 * the latest value).
 */
export function useSaveEpisodeGradeMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    EpisodeGrade,
    Error,
    { episodeId: string; data: EpisodeGradeUpdate }
  >({
    mutationFn: async ({ episodeId, data }) => {
      const response = await fetch(`/web/api/episodes/${episodeId}/grades/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to save grade: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: episodesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: episodesQueryKeys.detail(variables.episodeId),
      });
      queryClient.invalidateQueries({
        queryKey: episodeGradeQueryKeys.my(variables.episodeId),
      });
      queryClient.invalidateQueries({
        queryKey: episodeGradeQueryKeys.lists(variables.episodeId),
      });
    },
    onError: (error) => {
      toast.error("Failed to save grade", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
