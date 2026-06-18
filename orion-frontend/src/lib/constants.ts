import {
  LayoutDashboard,
  Package,
  Kanban,
  Wallet,
  Calculator,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Modulo } from "@/types/usuario";
import type { TipoEnvio } from "@/types/pedido";

/** Ítems de navegación del sidebar admin (SDD doc 06.3). */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Módulo de permisos asociado (para filtrar por permisos en sprints siguientes). */
  modulo?: Modulo;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: Package, modulo: "pedidos" },
  { label: "Tablero", href: "/admin/tablero", icon: Kanban, modulo: "tablero" },
  { label: "Finanzas", href: "/admin/finanzas", icon: Wallet, modulo: "finanzas" },
  { label: "Cotizador", href: "/admin/cotizador", icon: Calculator, modulo: "cotizador" },
  {
    label: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    modulo: "configuracion",
  },
];

/** Colores de badges por estado de pedido (SDD doc 06.1). Se reusa en Sprint 2. */
export const ESTADO_BADGES: Record<string, { bg: string; text: string }> = {
  Recibido: { bg: "#E6F1FB", text: "#0C447C" },
  "En tránsito": { bg: "#FAEEDA", text: "#854F0B" },
  "En aduana": { bg: "#EEEDFE", text: "#3C3489" },
  "En almacén": { bg: "#E8EDF8", text: "#1B2A5E" },
  Entregado: { bg: "#E1F5EE", text: "#085041" },
};

/** Etiquetas legibles para el tipo de envío (valores del CHECK en BD). */
export const TIPO_ENVIO_LABEL: Record<TipoEnvio, string> = {
  almacen: "Almacén",
  lima: "Lima",
  shalom: "Shalom",
};

/** Iniciales para el avatar a partir del nombre completo. */
export function getIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
