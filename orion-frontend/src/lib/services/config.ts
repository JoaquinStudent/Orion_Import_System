import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { ConfigPublica } from "@/types/config";

/** GET /config/publica — público (whatsapp de atención, nombre del negocio). */
export async function obtenerConfigPublica(): Promise<ConfigPublica> {
  const { data } = await api.get<ApiResponse<ConfigPublica>>("/config/publica");
  return data.data;
}
