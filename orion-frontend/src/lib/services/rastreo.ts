import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  ElegirEnvioRequest,
  RastreoRequest,
  RastreoResult,
} from "@/types/rastreo";

/** POST /rastreo — valida tracking + orden y devuelve el estado del pedido (público). */
export async function rastrear(req: RastreoRequest): Promise<RastreoResult> {
  const { data } = await api.post<ApiResponse<RastreoResult>>("/rastreo", req);
  return data.data;
}

/** PATCH /rastreo/tipo-envio — el cliente elige cómo recibir su pedido (público). */
export async function elegirTipoEnvio(
  req: ElegirEnvioRequest
): Promise<RastreoResult> {
  const { data } = await api.patch<ApiResponse<RastreoResult>>(
    "/rastreo/tipo-envio",
    req
  );
  return data.data;
}
