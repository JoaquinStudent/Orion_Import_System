import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Paginated, Pedido } from "@/types/pedido";
import type { Solicitud, SolicitudInput } from "@/types/solicitud";

/** POST /solicitudes — público: el cliente registra su pedido desde la landing. */
export async function crearSolicitudPublica(input: SolicitudInput): Promise<Solicitud> {
  const { data } = await api.post<ApiResponse<Solicitud>>("/solicitudes", input);
  return data.data;
}

/** GET /comunidades/publicas — público: nombres de comunidades activas (combobox). */
export async function listarComunidadesPublicas(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<string[]>>("/comunidades/publicas");
  return data.data;
}

/** GET /solicitudes — bandeja de revisión del admin. */
export async function listarSolicitudes(
  estado = "pendiente",
  page = 0,
  size = 20
): Promise<Paginated<Solicitud>> {
  const { data } = await api.get<ApiResponse<Paginated<Solicitud>>>("/solicitudes", {
    params: { estado, page, size },
  });
  return data.data;
}

/** POST /solicitudes/{id}/aprobar — crea el pedido real y marca la solicitud aprobada. */
export async function aprobarSolicitud(id: number): Promise<Pedido> {
  const { data } = await api.post<ApiResponse<Pedido>>(`/solicitudes/${id}/aprobar`, {});
  return data.data;
}

/** POST /solicitudes/{id}/rechazar. */
export async function rechazarSolicitud(id: number): Promise<Solicitud> {
  const { data } = await api.post<ApiResponse<Solicitud>>(`/solicitudes/${id}/rechazar`, {});
  return data.data;
}
