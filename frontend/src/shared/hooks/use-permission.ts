"use client";

import { useMeQuery } from "@/features/users";

import { hasPermission, type PermissionAction } from "../lib/permissions";

export function usePermission(action: PermissionAction): boolean {
  const { data: me } = useMeQuery();
  return hasPermission(me?.role, action);
}
