"use client";

import { useState } from "react";
import { Bell, Menu, LogOut } from "lucide-react";

import { getIniciales } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "@/components/admin/Sidebar";
import type { Usuario } from "@/types/usuario";

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function fechaLarga(): string {
  return new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function Topbar({
  usuario,
  onLogout,
}: {
  usuario: Usuario | null;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-outline-variant bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Menú hamburguesa (móvil) */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Abrir menú"
            className="rounded-md p-2 text-on-surface-variant hover:bg-secondary lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-0 bg-navy p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SidebarNav
              usuario={usuario}
              onLogout={onLogout}
              onNavigate={() => setMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">
            {saludo()}, {usuario?.nombre?.split(" ")[0] ?? ""} 👋
          </p>
          <p className="hidden text-xs capitalize text-on-surface-muted sm:block">
            {fechaLarga()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-md p-2 text-on-surface-variant hover:bg-secondary"
        >
          <Bell className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Menú de usuario" className="outline-none">
            <Avatar className="h-9 w-9">
              <AvatarFallback
                style={{ backgroundColor: usuario?.avatar_color ?? "#1B2A5E" }}
              >
                {usuario ? getIniciales(usuario.nombre) : "?"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{usuario?.nombre ?? "Usuario"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
