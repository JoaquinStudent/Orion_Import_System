import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { FinanzasKpis, FinanzasQuery, FinanzasResumen } from "@/types/finanzas";

/** GET /finanzas/resumen — admin (permiso finanzas.ver). */
export async function obtenerResumen(
  query: FinanzasQuery = {}
): Promise<FinanzasResumen> {
  const { data } = await api.get<ApiResponse<FinanzasResumen>>(
    "/finanzas/resumen",
    { params: query }
  );
  return data.data;
}

/** GET /finanzas/kpis — tarjetas KPI server-side (permiso finanzas.ver). */
export async function obtenerKpis(): Promise<FinanzasKpis> {
  const { data } = await api.get<ApiResponse<FinanzasKpis>>("/finanzas/kpis");
  return data.data;
}

/**
 * GET /finanzas/exportar — devuelve un .xlsx (generado por el backend con POI).
 * Descarga el archivo disparando un enlace temporal en el navegador.
 */
export async function exportarExcel(query: FinanzasQuery = {}): Promise<void> {
  const res = await api.get("/finanzas/exportar", {
    params: query,
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finanzas-orion-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
