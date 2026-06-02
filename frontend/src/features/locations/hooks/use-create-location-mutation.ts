"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { locationsQueryKeys } from "./use-locations-query";

type LocationCreate = z.infer<typeof schemas.LocationCreate>;
type Location = z.infer<typeof schemas.Location>;

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, LocationCreate>({
    mutationFn: async (data: LocationCreate) => {
      const response = await fetch("/web/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create location: ${response.statusText}`);
      }
      const responseData = await response.json();
      return schemas.Location.parse(responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationsQueryKeys.lists(),
      });
      toast.success("Location created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create location", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
