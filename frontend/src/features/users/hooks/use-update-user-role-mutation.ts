"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { usersQueryKeys } from "./use-users-query";

type UserResponse = z.infer<typeof schemas.UserResponse>;
type UserRoleUpdateRequest = z.infer<typeof schemas.UserRoleUpdateRequest>;

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UserResponse,
    Error,
    { userId: string; data: UserRoleUpdateRequest }
  >({
    mutationFn: async ({ userId, data }) => {
      const response = await fetch(`/web/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user role", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
