"use client";

/**
 * Create Episode Mutation Hook
 * Provides mutation for creating a new episode
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { episodesQueryKeys } from "./use-episodes-query";

type EpisodeCreate = z.infer<typeof schemas.EpisodeCreate>;
type Episode = z.infer<typeof schemas.Episode>;

/**
 * Hook to create a new episode
 */
export function useCreateEpisodeMutation() {
  const queryClient = useQueryClient();

  return useMutation<Episode, Error, EpisodeCreate>({
    mutationFn: async (data: EpisodeCreate) => {
      const response = await fetch("/web/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.error || `Failed to create episode: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: episodesQueryKeys.lists(),
      });
      toast.success("Episode created successfully");
    },
  });
}
