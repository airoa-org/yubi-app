import { apiConfig } from "./config";
import { createApiClient } from "./generated/api";

import type { ZodiosError } from "@zodios/core";

export const apiClient = createApiClient(apiConfig.baseURL, {
  axiosConfig: {
    timeout: apiConfig.timeout,
    headers: {
      "Content-Type": "application/json",
    },
  },
});

apiClient.axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.error("Unauthorized access - please login");
          break;

        case 403:
          console.error("Access forbidden");
          break;

        case 404:
          console.error("Resource not found");
          break;

        case 500:
          console.error("Internal server error");
          break;

        default:
          console.error(`API Error: ${status}`);
      }
    } else if (error.request) {
      console.error("Network error - no response received");
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export function isZodiosError(error: unknown): error is ZodiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    "config" in error
  );
}
