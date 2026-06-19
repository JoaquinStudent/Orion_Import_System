import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { DashboardResumen } from "@/types/dashboard";

/** GET /dashboard/resumen — KPIs + últimos pedidos (permiso pedidos.ver). */
export async function obtenerDashboardResumen(): Promise<DashboardResumen> {
  const { data } = await api.get<ApiResponse<DashboardResumen>>("/dashboard/resumen");
  return data.data;
}
