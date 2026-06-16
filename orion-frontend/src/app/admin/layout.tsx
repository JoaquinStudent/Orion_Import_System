"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { SidebarNav } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

/** Rutas de autenticación: se muestran sin sidebar ni topbar. */
const BARE_ROUTES = ["/admin/login", "/admin/cambiar-password"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const [checked, setChecked] = useState(false);

  const isLogin = pathname === "/admin/login";
  const bare = BARE_ROUTES.includes(pathname);

  useEffect(() => {
    // El login es la única ruta totalmente pública del panel.
    if (!isLogin && !isAuthenticated()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [pathname, isLogin, router]);

  // Pantallas de autenticación (login, cambiar contraseña): sin chrome.
  if (bare) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  // Evita parpadeo de contenido protegido antes de validar la sesión.
  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-60">
          <SidebarNav usuario={usuario} onLogout={logout} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar usuario={usuario} onLogout={logout} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
