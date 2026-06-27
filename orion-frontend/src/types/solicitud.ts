import type { ProductoInput } from "@/types/pedido";

/** Estado de una solicitud de registro hecha por un cliente. */
export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada";

/** Payload del registro público de pedido (POST /solicitudes). Sin costo/estado. */
export interface SolicitudInput {
  titular: string;
  comunidad: string;
  consignatario?: string;
  firma?: string;
  num_orden: string;
  num_tracking: string;
  whatsapp: string;
  valor_usd?: number;
  productos: ProductoInput[];
  /** Token de Cloudflare Turnstile (snake_case en el contrato del back). */
  turnstile_token?: string;
}

/** Solicitud tal como la devuelve la API (alta y bandeja de revisión). */
export interface Solicitud {
  id: number;
  titular: string;
  comunidad: string;
  consignatario?: string;
  firma?: string;
  num_orden: string;
  num_tracking: string;
  whatsapp: string;
  valor_usd: number;
  productos: { cantidad: number; producto: string; marca?: string }[];
  estado: EstadoSolicitud;
  creado_en: string;
}
