import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Comunidad, ComunidadInput } from "@/types/comunidad";

/** GET /comunidades — catálogo de comunidades (autenticado; llena el combobox). */
export async function listarComunidades(): Promise<Comunidad[]> {
  const { data } = await api.get<ApiResponse<Comunidad[]>>("/comunidades");
  return data.data;
}

/** POST /comunidades — ADMIN. */
export async function crearComunidad(input: ComunidadInput): Promise<Comunidad> {
  const { data } = await api.post<ApiResponse<Comunidad>>("/comunidades", input);
  return data.data;
}

/** PUT /comunidades/{id} — ADMIN. */
export async function actualizarComunidad(
  id: number,
  input: ComunidadInput
): Promise<Comunidad> {
  const { data } = await api.put<ApiResponse<Comunidad>>(`/comunidades/${id}`, input);
  return data.data;
}

/** DELETE /comunidades/{id} — ADMIN. */
export async function eliminarComunidad(id: number): Promise<void> {
  await api.delete(`/comunidades/${id}`);
}
