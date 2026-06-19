"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, getIniciales } from "@/lib/constants";
import { puedeVer } from "@/lib/permisos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Usuario } from "@/types/usuario";

/**
 * Contenido de navegación del panel (SDD doc 06.3).
 * Reutilizado por el sidebar fijo (desktop) y por el Sheet (móvil).
 */
export function SidebarNav({
  usuario,
  onLogout,
  onNavigate,
}: {
  usuario: Usuario | null;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-navy text-white">
      {/* Logo / marca */}
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-navy">
          <Compass className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">Orión Logistic</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.filter(
          (item) => !item.modulo || puedeVer(usuario, item.modulo)
        ).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                active &&
                  "border-gold bg-white/10 text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              style={{ backgroundColor: usuario?.avatar_color ?? "#1B2A5E" }}
            >
              {usuario ? getIniciales(usuario.nombre) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {usuario?.nombre ?? "—"}
            </p>
            <p className="truncate text-xs text-white/60">
              {usuario?.rol === "ADMIN" ? "Administrador" : "Empleado"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
