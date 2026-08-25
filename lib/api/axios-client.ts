import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

/**
 * Resolve Backend API base URL
 */
export function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api/v1"
    );
  }
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

/**
 * Get JWT token from browser cookies if running client-side
 */
function getCookieToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)smuke_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Client-Side API Client (Proxies to Next.js BFF Routes /api/*)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookieToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string; error?: string })?.message ||
      (error.response?.data as { message?: string; error?: string })?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

/**
 * Server-Side Backend API Client (Communicates directly with NestJS Backend)
 */
export const backendApiClient: AxiosInstance = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Helper to create an authenticated backend axios client for server handlers
 */
export function getAuthenticatedBackendClient(token?: string | null): AxiosInstance {
  const instance = axios.create({
    baseURL: getBackendUrl(),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 30000,
  });
  return instance;
}
