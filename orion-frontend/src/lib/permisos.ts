import type { Modulo, Usuario } from "@/types/usuario";

/**
 * Helpers de permisos por módulo (doc 07 / contrato 05b).
 * Regla: ADMIN siempre tiene acceso total; EMPLEADO según su array `permisos`.
 */

export function puedeVer(usuario: Usuario | null, modulo: Modulo): boolean {
  if (!usuario) return false;
  if (usuario.rol === "ADMIN") return true;
  return usuario.permisos?.some((p) => p.modulo === modulo && p.puede_ver) ?? false;
}

export function puedeEditar(usuario: Usuario | null, modulo: Modulo): boolean {
  if (!usuario) return false;
  if (usuario.rol === "ADMIN") return true;
  return (
    usuario.permisos?.some((p) => p.modulo === modulo && p.puede_editar) ?? false
  );
}
