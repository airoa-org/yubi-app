"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { apiKeysQueryKeys } from "./use-api-keys-query";

export function useRevokeApiKeyMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<void, Error, { apiKeyId: string }>({
    mutationFn: async ({ apiKeyId }) => {
      const response = await fetch(`/web/api/api-keys/${apiKeyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to revoke api key: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.all });
      toast.success(t("revokeApiKeyDialog.successToast"));
    },
    onError: (error) => {
      toast.error(t("revokeApiKeyDialog.errorToast"), {
        description: error.message,
      });
    },
  });
}
