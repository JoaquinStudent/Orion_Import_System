"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getUsuario, setUsuario as persistUsuario } from "@/lib/auth";
import { obtenerMe } from "@/lib/services/usuarios";
import type { Usuario } from "@/types/usuario";

/**
 * Estado de sesión del panel admin.
 * Lee el usuario de la cookie y expone logout().
 */
export function useAuth() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheado = getUsuario();
    setUsuario(cacheado);
    setLoading(false);
    // Refresca permisos contra el backend (la cookie del login queda stale si un
    // ADMIN cambia permisos). Fallo silencioso: el interceptor ya maneja el 401.
    if (cacheado) {
      obtenerMe()
        .then((fresco) => {
          persistUsuario(fresco);
          setUsuario(fresco);
        })
        .catch(() => {});
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Aunque el backend falle, cerramos sesión localmente.
    } finally {
      clearSession();
      router.replace("/admin/login");
    }
  }, [router]);

  return { usuario, loading, logout };
}
