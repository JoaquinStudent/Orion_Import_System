import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  EstadoPago,
  Paginated,
  Pedido,
  PedidoInput,
  PedidoListItem,
  PedidosQuery,
} from "@/types/pedido";

/** GET /pedidos — listado paginado con filtros (estado, búsqueda). */
export async function listarPedidos(
  query: PedidosQuery = {}
): Promise<Paginated<PedidoListItem>> {
  const { data } = await api.get<ApiResponse<Paginated<PedidoListItem>>>(
    "/pedidos",
    { params: query }
  );
  return data.data;
}

/** GET /pedidos/{id} — detalle completo. */
export async function obtenerPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<ApiResponse<Pedido>>(`/pedidos/${id}`);
  return data.data;
}

/** POST /pedidos — crea un pedido (y sus productos). */
export async function crearPedido(input: PedidoInput): Promise<Pedido> {
  const { data } = await api.post<ApiResponse<Pedido>>("/pedidos", input);
  return data.data;
}

/** PUT /pedidos/{id} — reemplaza datos y la lista de productos. */
export async function actualizarPedido(
  id: number,
  input: PedidoInput
): Promise<Pedido> {
  const { data } = await api.put<ApiResponse<Pedido>>(`/pedidos/${id}`, input);
  return data.data;
}

/** PATCH /pedidos/{id}/estado — mueve el pedido en el tablero. */
export async function cambiarEstadoPedido(
  id: number,
  estadoId: number
): Promise<Pedido> {
  const { data } = await api.patch<ApiResponse<Pedido>>(
    `/pedidos/${id}/estado`,
    { estado_id: estadoId }
  );
  return data.data;
}

/** PATCH /pedidos/{id}/costo — fija el costo de importación (se carga al llegar al almacén). */
export async function cambiarCostoImportacion(
  id: number,
  costoUsd: number
): Promise<Pedido> {
  const { data } = await api.patch<ApiResponse<Pedido>>(`/pedidos/${id}/costo`, {
    costo_importacion_usd: costoUsd,
  });
  return data.data;
}

/** PATCH /pedidos/{id}/pago — cambia el estado de pago de la importación. */
export async function cambiarEstadoPago(
  id: number,
  estadoPago: EstadoPago
): Promise<Pedido> {
  const { data } = await api.patch<ApiResponse<Pedido>>(`/pedidos/${id}/pago`, {
    estado_pago: estadoPago,
  });
  return data.data;
}

/** DELETE /pedidos/{id}. */
export async function eliminarPedido(id: number): Promise<void> {
  await api.delete(`/pedidos/${id}`);
}
