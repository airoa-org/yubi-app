"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { locationsQueryKeys } from "./use-locations-query";

export function useDeleteLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { locationId: string }>({
    mutationFn: async ({ locationId }) => {
      const response = await fetch(`/web/api/locations/${locationId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete location: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationsQueryKeys.lists(),
      });
      toast.success("Location deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete location", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
