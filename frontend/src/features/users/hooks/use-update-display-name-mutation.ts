"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { meQueryKeys } from "./use-me-query";
import { usersQueryKeys } from "./use-users-query";

type UserResponse = z.infer<typeof schemas.UserResponse>;

export function useUpdateDisplayNameMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { displayName: string }>({
    mutationFn: async ({ displayName }) => {
      const response = await fetch("/web/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? body?.message ?? response.statusText);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      toast.success(t("editDisplayNameDialog.success"));
    },
    onError: (error) => {
      toast.error(t("editDisplayNameDialog.errorTitle"), {
        description: error.message,
      });
    },
  });
}
