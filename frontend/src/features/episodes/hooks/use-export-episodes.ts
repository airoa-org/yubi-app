"use client";

import { useMutation } from "@tanstack/react-query";

export type ExportEpisodesFilter = {
  task_id?: string;
  task_version_id?: string;
  robot_id?: string;
  user_id?: string;
  status?: number[];
  started_at_from?: string;
  started_at_to?: string;
};

export function useExportEpisodesMutation() {
  return useMutation<void, Error, ExportEpisodesFilter>({
    mutationFn: async (filter: ExportEpisodesFilter) => {
      const params = new URLSearchParams();
      if (filter.task_id) params.set("task_id", filter.task_id);
      if (filter.task_version_id)
        params.set("task_version_id", filter.task_version_id);
      if (filter.robot_id) params.set("robot_id", filter.robot_id);
      if (filter.user_id) params.set("user_id", filter.user_id);
      filter.status?.forEach((s) => params.append("status", String(s)));
      if (filter.started_at_from)
        params.set("started_at_from", filter.started_at_from);
      if (filter.started_at_to)
        params.set("started_at_to", filter.started_at_to);

      const response = await fetch(
        `/web/api/episodes/export?${params.toString()}`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Export failed: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "episodes_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
