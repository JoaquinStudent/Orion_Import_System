"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getUsuario, setUsuario as persistUsuario } from "@/lib/auth";
import { obtenerMe } from "@/lib/services/usuarios";
import type { Usuario } from "@/types/usuario";

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  /** Setea la sesión de forma sincrónica (cookie + estado). La usa el login. */
  login: (usuario: Usuario) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Fuente de verdad única de la sesión del panel. Montado una sola vez (Providers),
 * así `Topbar`/`SidebarNav`/páginas leen el mismo `usuario` y se actualizan al
 * instante tras el login, sin necesidad de remontar el layout ni refrescar.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  const login = useCallback((u: Usuario) => {
    persistUsuario(u);
    setUsuario(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Aunque el backend falle, cerramos sesión localmente.
    } finally {
      clearSession();
      setUsuario(null);
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
