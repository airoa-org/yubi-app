"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  UserImportValidationResponse,
  UserImportResponse,
} from "@/lib/api/backend-client";

import { usersQueryKeys } from "./use-users-query";

export function useValidateUserImportMutation() {
  return useMutation<UserImportValidationResponse, Error, string>({
    mutationFn: async (csvContent: string) => {
      const response = await fetch("/web/api/users/import/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: csvContent }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message ||
            error.error ||
            `Validation failed: ${response.statusText}`
        );
      }
      return response.json();
    },
  });
}

export function useImportUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation<UserImportResponse, Error, string>({
    mutationFn: async (csvContent: string) => {
      const response = await fetch("/web/api/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: csvContent }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message ||
            error.error ||
            `Import failed: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
    },
  });
}
