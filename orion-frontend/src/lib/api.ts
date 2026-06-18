import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getToken, clearSession } from "@/lib/auth";
import type { ApiError } from "@/types/api";

/**
 * Instancia Axios central (SDD doc 03.3 / 05).
 * - Inyecta el JWT en Authorization: Bearer <token>.
 * - Ante 401 (o 403 sin sesión válida) limpia la sesión y va a /admin/login.
 * - Ante 403 SIN_PERMISO (logueado pero sin permiso del módulo) avisa con toast.
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
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      const path = window.location.pathname;

      // 403 SIN_PERMISO = autenticado pero sin permiso del módulo → solo avisar.
      if (status === 403 && code === "SIN_PERMISO") {
        toast.error(
          error.response?.data?.error ?? "No tenés permiso para esta acción"
        );
      } else if (status === 401 || status === 403) {
        // Sesión inválida/vencida (incluye el 403 "pelado" del backend sin token).
        clearSession();
        if (!path.startsWith("/admin/login")) {
          window.location.href = "/admin/login";
        }
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
