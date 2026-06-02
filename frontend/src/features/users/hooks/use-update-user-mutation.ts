"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { usersQueryKeys } from "./use-users-query";

type UserResponse = z.infer<typeof schemas.UserResponse>;

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UserResponse,
    Error,
    { userId: string; data: { location_ids: string[] } }
  >({
    mutationFn: async ({ userId, data }) => {
      const response = await fetch(`/web/api/users/${userId}/locations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update user locations: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
