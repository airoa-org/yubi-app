"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { episodesQueryKeys } from "./use-episodes-query";

interface CreateEpisodesBulkInput {
  organization_id: string;
  location_id: string;
  robot_id: string;
  task_id: string;
  recorded_by?: string;
  count: number;
}

interface Episode {
  id: string;
}

export function useCreateEpisodesBulkMutation() {
  const queryClient = useQueryClient();

  return useMutation<Episode[], Error, CreateEpisodesBulkInput>({
    mutationFn: async (data: CreateEpisodesBulkInput) => {
      const response = await fetch("/web/api/episodes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create episodes: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (episodes) => {
      queryClient.invalidateQueries({
        queryKey: episodesQueryKeys.lists(),
      });
      toast.success(`${episodes.length} episodes created successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to create episodes. Please try again."
      );
    },
  });
}
