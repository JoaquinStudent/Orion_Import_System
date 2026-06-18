import type { TipoEnvio } from "@/types/pedido";

/** Request del rastreo público (POST /rastreo, doc 05.9). */
export interface RastreoRequest {
  num_tracking: string;
  num_orden: string;
}

/** Un paso del recorrido del pedido. */
export interface RastreoEstado {
  nombre: string;
  completado: boolean;
  activo?: boolean;
}

/** Producto resumido tal como lo ve el cliente en el rastreo. */
export interface RastreoProducto {
  cantidad: number;
  producto: string;
  marca?: string;
}

/** Resultado del rastreo (doc 05.9). */
export interface RastreoResult {
  titular: string;
  consignatario?: string;
  comunidad?: string;
  productos: RastreoProducto[];
  estado_actual: string;
  estados: RastreoEstado[];
  tipo_envio: TipoEnvio | null;
  puede_elegir_envio: boolean;
}

/** Request para elegir el tipo de envío (PATCH /rastreo/tipo-envio). */
export interface ElegirEnvioRequest {
  num_tracking: string;
  num_orden: string;
  tipo_envio: TipoEnvio;
}
