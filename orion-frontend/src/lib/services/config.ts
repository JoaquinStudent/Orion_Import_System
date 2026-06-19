import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { ConfigPublica } from "@/types/config";

/** GET /config/publica — público (whatsapp de atención, nombre del negocio). */
export async function obtenerConfigPublica(): Promise<ConfigPublica> {
  const { data } = await api.get<ApiResponse<ConfigPublica>>("/config/publica");
  return data.data;
}

/** PUT /admin/config — actualiza la config general (ADMIN). */
export async function actualizarConfigGeneral(
  input: Partial<ConfigPublica>
): Promise<ConfigPublica> {
  const { data } = await api.put<ApiResponse<ConfigPublica>>("/admin/config", input);
  return data.data;
}
