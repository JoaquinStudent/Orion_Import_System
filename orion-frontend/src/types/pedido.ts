import type { EstadoRef } from "@/types/estado";

/** Tipo de envío permitido (CHECK en BD: almacen | lima | shalom). */
export type TipoEnvio = "almacen" | "lima" | "shalom";

/** Estado del pago de la importación. Solo "liquidado" cuenta como ingreso. */
export type EstadoPago = "pendiente" | "liquidado";

/** Línea de producto de un pedido. */
export interface Producto {
  id: number;
  cantidad: number;
  producto: string;
  marca?: string;
}

/** Línea de producto al crear/editar un pedido (sin id). */
export interface ProductoInput {
  cantidad: number;
  producto: string;
  marca?: string;
}

/** Pedido tal como aparece en el listado (GET /pedidos). */
export interface PedidoListItem {
  id: number;
  num_orden: string;
  num_tracking: string;
  titular: string;
  whatsapp: string;
  valor_usd: number;
  costo_importacion_usd: number;
  tipo_envio: TipoEnvio | null;
  estado: EstadoRef;
  estado_pago: EstadoPago;
  creado_en: string;
}

/** Pedido completo (GET /pedidos/{id}). */
export interface Pedido {
  id: number;
  comunidad?: string;
  titular: string;
  consignatario?: string;
  num_orden: string;
  num_tracking: string;
  whatsapp: string;
  firma?: string;
  valor_usd: number;
  costo_importacion_usd: number;
  tipo_envio: TipoEnvio | null;
  estado: EstadoRef;
  estado_pago: EstadoPago;
  productos: Producto[];
  creado_por?: { id: number; nombre: string };
  creado_en: string;
  actualizado_en: string | null;
}

/** Payload para crear o editar un pedido (POST/PUT /pedidos). */
export interface PedidoInput {
  comunidad?: string;
  titular: string;
  consignatario?: string;
  num_orden: string;
  num_tracking: string;
  whatsapp: string;
  firma?: string;
  valor_usd?: number;
  costo_importacion_usd: number;
  tipo_envio?: TipoEnvio | null;
  estado_id?: number;
  productos: ProductoInput[];
}

/** Filtros del listado de pedidos. */
export interface PedidosQuery {
  estado_id?: number;
  search?: string;
  page?: number;
  size?: number;
}

/** Respuesta paginada estándar (Spring Page → snake_case). */
export interface Paginated<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

/** Pedido resumido dentro de una columna del tablero. */
export interface TableroPedidoCard {
  id: number;
  num_orden: string;
  titular: string;
  costo_importacion_usd: number;
}

/** Columna del tablero kanban (GET /tablero): un estado con sus pedidos. */
export interface TableroColumna {
  id: number;
  nombre: string;
  color: string;
  pedidos: TableroPedidoCard[];
}
