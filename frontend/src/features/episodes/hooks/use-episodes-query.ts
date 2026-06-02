/**
 * Episodes Query Hooks
 * Provides TanStack Query hooks for fetching episodes data
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import type { EpisodeCollectionStatusValue } from "@/shared/lib/status-constants";

import type { UseQueryOptions } from "@tanstack/react-query";

type Episode = z.infer<typeof schemas.Episode>;
type EpisodeListResponse = z.infer<typeof schemas.EpisodeListResponse>;

/**
 * Query parameters for listing episodes
 */
interface ListEpisodesParams {
  task_id?: string;
  task_version_id?: string;
  robot_id?: string;
  user_id?: string;
  status?: EpisodeCollectionStatusValue[];
  started_at_from?: string;
  started_at_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

/**
 * Query keys for episodes
 * Hierarchical structure for efficient cache invalidation
 */
export const episodesQueryKeys = {
  all: ["episodes"] as const,
  lists: () => [...episodesQueryKeys.all, "list"] as const,
  list: (params: ListEpisodesParams = {}) =>
    [...episodesQueryKeys.lists(), params] as const,
  details: () => [...episodesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...episodesQueryKeys.details(), id] as const,
  next: () => [...episodesQueryKeys.all, "next"] as const,
};

/**
 * Hook to fetch episodes list
 * @param params - Query parameters (task_id, status)
 * @param options - TanStack Query options
 */
export function useEpisodesQuery(
  params: ListEpisodesParams = {},
  options?: Omit<
    UseQueryOptions<EpisodeListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<EpisodeListResponse, Error>({
    queryKey: episodesQueryKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.task_id) queryParams.set("task_id", params.task_id);
      if (params.task_version_id)
        queryParams.set("task_version_id", params.task_version_id);
      if (params.robot_id) queryParams.set("robot_id", params.robot_id);
      if (params.user_id) queryParams.set("user_id", params.user_id);
      params.status?.forEach((s) => queryParams.append("status", String(s)));
      if (params.started_at_from)
        queryParams.set("started_at_from", params.started_at_from);
      if (params.started_at_to)
        queryParams.set("started_at_to", params.started_at_to);
      if (params.page !== undefined)
        queryParams.set("page", String(params.page));
      if (params.limit !== undefined)
        queryParams.set("limit", String(params.limit));
      if (params.sort_by) queryParams.set("sort_by", params.sort_by);
      if (params.sort_order) queryParams.set("sort_order", params.sort_order);
      const queryString = queryParams.toString();
      const url = `/web/api/episodes${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch episodes: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.EpisodeListResponse.parse(data);
    },
    ...options,
  });
}

/**
 * Hook to fetch a single episode by ID
 * @param episodeId - Episode ID
 * @param options - TanStack Query options
 */
export function useEpisodeQuery(
  episodeId: string,
  options?: Omit<UseQueryOptions<Episode, Error>, "queryKey" | "queryFn">
) {
  return useQuery<Episode, Error>({
    queryKey: episodesQueryKeys.detail(episodeId),
    queryFn: async () => {
      const response = await fetch(`/web/api/episodes/${episodeId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch episode: ${response.statusText}`);
      }
      const data = await response.json();
      return schemas.Episode.parse(data);
    },
    ...options,
  });
}

// TODO: Implement useNextEpisodeQuery when API endpoint is available
// type GetNextEpisodeResponse = Awaited<
//   ReturnType<typeof apiClient.getNextEpisode>
// >;

// /**
//  * Hook to fetch the next episode to process
//  * @param options - TanStack Query options
//  */
// export function useNextEpisodeQuery(
//   options?: Omit<
//     UseQueryOptions<GetNextEpisodeResponse, ZodiosError>,
//     "queryKey" | "queryFn"
//   >
// ) {
//   return useQuery<GetNextEpisodeResponse, ZodiosError>({
//     queryKey: episodesQueryKeys.next(),
//     queryFn: async () => {
//       const nextEpisode = await apiClient.getNextEpisode();
//       return nextEpisode;
//     },
//     ...options,
//   });
// }
