"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

import { usersQueryKeys } from "./use-users-query";

type UserResponse = z.infer<typeof schemas.UserResponse>;

export type CreateUserData = z.infer<typeof schemas.UserCreateRequest>;

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, CreateUserData>({
    mutationFn: async (data) => {
      const response = await fetch("/web/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body?.message ?? `Failed to create user: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create user", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
