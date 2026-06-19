import type { PedidoListItem } from "@/types/pedido";

/** Resumen del dashboard calculado server-side (GET /dashboard/resumen). */
export interface DashboardResumen {
  pedidos_hoy: number;
  en_transito: number;
  en_aduana: number;
  entregados_mes: number;
  ultimos: PedidoListItem[];
}
