"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { apiKeysQueryKeys } from "./use-api-keys-query";

export type CreateApiKeyData = z.infer<typeof schemas.ApiKeyCreateRequest>;
export type ApiKeyCreateResponse = z.infer<typeof schemas.ApiKeyCreateResponse>;

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<ApiKeyCreateResponse, Error, CreateApiKeyData>({
    mutationFn: async (data) => {
      const response = await fetch("/web/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string })?.error ??
            `Failed to create api key: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.all });
      toast.success(t("createApiKeyDialog.successToast"));
    },
    onError: (error) => {
      toast.error(t("createApiKeyDialog.errorToast"), {
        description: error.message,
      });
    },
  });
}
