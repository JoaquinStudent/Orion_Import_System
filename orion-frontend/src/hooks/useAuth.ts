"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getUsuario } from "@/lib/auth";
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
    setUsuario(getUsuario());
    setLoading(false);
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
