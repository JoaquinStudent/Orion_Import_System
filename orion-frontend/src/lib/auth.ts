import Cookies from "js-cookie";
import type { Usuario } from "@/types/usuario";

/**
 * Manejo de sesión en el cliente.
 *
 * Nota (coordinar con José antes de producción): el SDD recomienda cookie httpOnly.
 * Como el backend vive en otro dominio (Railway), eso exige que el backend setee la
 * cookie (SameSite=None; Secure) + withCredentials. Para Sprint 1 usamos una cookie
 * legible por JS, suficiente para el guard de rutas del frontend.
 */
const TOKEN_KEY = "orion_token";
const USER_KEY = "orion_user";

const cookieOpts: Cookies.CookieAttributes = {
  expires: 1, // 1 día (coincide con JWT_EXPIRATION por defecto)
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, cookieOpts);
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setUsuario(usuario: Usuario): void {
  Cookies.set(USER_KEY, JSON.stringify(usuario), cookieOpts);
}

export function getUsuario(): Usuario | null {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
