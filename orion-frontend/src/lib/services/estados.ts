import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Estado, EstadoInput } from "@/types/estado";
import type { TableroColumna } from "@/types/pedido";

/** GET /estados — lista de estados (para selectores y CRUD del tablero). */
export async function listarEstados(): Promise<Estado[]> {
  const { data } = await api.get<ApiResponse<Estado[]>>("/estados");
  return data.data;
}

/** GET /tablero — columnas del kanban (estado + sus pedidos). */
export async function obtenerTablero(): Promise<TableroColumna[]> {
  const { data } = await api.get<ApiResponse<TableroColumna[]>>("/tablero");
  return data.data;
}

/** POST /estados — crea un estado personalizado. */
export async function crearEstado(input: EstadoInput): Promise<Estado> {
  const { data } = await api.post<ApiResponse<Estado>>("/estados", input);
  return data.data;
}

/** PUT /estados/{id}. */
export async function actualizarEstado(
  id: number,
  input: EstadoInput
): Promise<Estado> {
  const { data } = await api.put<ApiResponse<Estado>>(`/estados/${id}`, input);
  return data.data;
}

/** DELETE /estados/{id} — falla con 409 si el estado tiene pedidos. */
export async function eliminarEstado(id: number): Promise<void> {
  await api.delete(`/estados/${id}`);
}
