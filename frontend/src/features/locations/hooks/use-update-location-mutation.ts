"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { locationsQueryKeys } from "./use-locations-query";

type LocationUpdate = z.infer<typeof schemas.LocationUpdate>;
type Location = z.infer<typeof schemas.Location>;

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Location,
    Error,
    { locationId: string; data: LocationUpdate }
  >({
    mutationFn: async ({ locationId, data }) => {
      const response = await fetch(`/web/api/locations/${locationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update location: ${response.statusText}`);
      }
      const responseData = await response.json();
      return schemas.Location.parse(responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationsQueryKeys.all,
      });
      toast.success("Location updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update location", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
