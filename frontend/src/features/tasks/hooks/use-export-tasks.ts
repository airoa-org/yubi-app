"use client";

import { useMutation } from "@tanstack/react-query";

export type ExportTasksFilter = {
  status?: number[];
  priority?: number[];
  difficulty?: number[];
  robot_type?: string;
};

export function useExportTasksMutation() {
  return useMutation<void, Error, ExportTasksFilter>({
    mutationFn: async (filter: ExportTasksFilter) => {
      const params = new URLSearchParams();
      filter.status?.forEach((s) => params.append("status", String(s)));
      filter.priority?.forEach((p) => params.append("priority", String(p)));
      filter.difficulty?.forEach((d) => params.append("difficulty", String(d)));
      if (filter.robot_type) params.set("robot_type", filter.robot_type);

      const response = await fetch(
        `/web/api/tasks/export?${params.toString()}`
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
      a.download = "tasks_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
