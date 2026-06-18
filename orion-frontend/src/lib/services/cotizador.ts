import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CotizacionInput,
  CotizacionResult,
  CotizadorConfig,
  CotizadorConfigInput,
  TipoCambio,
} from "@/types/cotizador";

/** GET /cotizador/config — público (flete, desaduanaje, umbral, whatsapp). */
export async function obtenerConfigCotizador(): Promise<CotizadorConfig> {
  const { data } = await api.get<ApiResponse<CotizadorConfig>>("/cotizador/config");
  return data.data;
}

/** POST /cotizador/calcular — público. El cálculo lo hace el backend. */
export async function calcularCotizacion(
  input: CotizacionInput
): Promise<CotizacionResult> {
  const { data } = await api.post<ApiResponse<CotizacionResult>>(
    "/cotizador/calcular",
    input
  );
  return data.data;
}

/** GET /cotizador/tipo-cambio — público. */
export async function obtenerTipoCambio(): Promise<TipoCambio> {
  const { data } = await api.get<ApiResponse<TipoCambio>>("/cotizador/tipo-cambio");
  return data.data;
}

/** PUT /admin/cotizador/config — admin (permiso cotizador.editar). */
export async function actualizarConfigCotizador(
  input: CotizadorConfigInput
): Promise<CotizadorConfig> {
  const { data } = await api.put<ApiResponse<CotizadorConfig>>(
    "/admin/cotizador/config",
    input
  );
  return data.data;
}
