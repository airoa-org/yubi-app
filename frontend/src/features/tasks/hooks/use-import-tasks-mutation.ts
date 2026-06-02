"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  TaskImportValidationResponse,
  TaskImportResponse,
} from "@/lib/api/backend-client";

import { taskCompletionTrendQueryKeys } from "./use-task-completion-trend-query";
import { taskSummaryQueryKeys } from "./use-task-summary-query";
import { tasksQueryKeys } from "./use-tasks-query";

export function useValidateTaskImportMutation() {
  return useMutation<TaskImportValidationResponse, Error, string>({
    mutationFn: async (csvContent: string) => {
      const response = await fetch("/web/api/tasks/import/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: csvContent }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Validation failed: ${response.statusText}`
        );
      }
      return response.json();
    },
  });
}

export function useImportTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskImportResponse, Error, string>({
    mutationFn: async (csvContent: string) => {
      const response = await fetch("/web/api/tasks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: csvContent }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Import failed: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskSummaryQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: taskCompletionTrendQueryKeys.all,
      });
    },
  });
}
