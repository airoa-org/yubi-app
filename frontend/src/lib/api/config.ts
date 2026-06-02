/**
 * API Configuration
 * Centralized configuration for API client
 */

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
} as const;

/**
 * Validate required environment variables
 */
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    "NEXT_PUBLIC_API_BASE_URL is not defined. Using default: http://localhost:8000"
  );
}
