"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COOKIE_NAME = "active_user_id";
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://backend:8000";

/**
 * Switch the active user by setting a cookie.
 * Validates that the user exists in the backend before setting the cookie.
 * Throws an error if the user is not found.
 */
export async function switchUser(userId: string): Promise<void> {
  // Validate user exists before setting the cookie
  const res = await fetch(`${BACKEND_API_URL}/api/users/${userId}`, {
    headers: { "X-User-ID": userId },
  });
  if (!res.ok) {
    throw new Error("User not found");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    // secure is false because this is a development tool for local/LAN use.
    // For production, add proper authentication instead of cookie-based user switching.
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}

/**
 * Clear the active user cookie, reverting to DEFAULT_USER_ID.
 */
export async function clearActiveUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  revalidatePath("/", "layout");
}
