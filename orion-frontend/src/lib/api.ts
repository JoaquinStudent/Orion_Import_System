import axios, { AxiosError } from "axios";
import { getToken, clearSession } from "@/lib/auth";
import type { ApiError } from "@/types/api";

/**
 * Instancia Axios central (SDD doc 03.3 / 05).
 * - Inyecta el JWT en Authorization: Bearer <token>.
 * - Ante 401 limpia la sesión y redirige a /admin/login.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearSession();
      const path = window.location.pathname;
      // Evita bucle si ya estamos en una pantalla de auth pública.
      if (!path.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Extrae un mensaje de error legible del contrato { error } o de Axios. */
export function getApiErrorMessage(error: unknown, fallback = "Ocurrió un error. Intenta de nuevo."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.error ?? error.message ?? fallback;
  }
  return fallback;
}
