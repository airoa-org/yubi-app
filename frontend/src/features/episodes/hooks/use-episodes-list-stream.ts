"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { episodesQueryKeys } from "./use-episodes-query";
import { useSSEStream } from "./use-sse-stream";

/**
 * Subscribes to the episode list SSE stream and invalidates the episodes
 * query cache whenever any episode is created or mutated.
 */
export function useEpisodesListStream(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const url = useMemo(() => "/web/api/episodes/stream", []);

  const parse = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: episodesQueryKeys.lists(),
    });
    return null;
  }, [queryClient]);

  return useSSEStream<null>({
    url,
    enabled,
    label: "EpisodesListStream",
    parse,
  });
}
