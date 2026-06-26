/** Estado del flujo expuesto públicamente (nombre + color + orden, sin datos sensibles). */
export interface EstadoPublico {
  nombre: string;
  color: string;
  orden: number;
}

/** Configuración pública del negocio (GET /config/publica, doc 05.10). */
export interface ConfigPublica {
  whatsapp_atencion: string;
  nombre_negocio: string;
  /** Días tras la entrega para archivar un pedido del tablero (visual). */
  dias_archivo_entregados?: number;
  /** Estados del flujo (dinámicos) para mostrar en la landing. */
  estados?: EstadoPublico[];
}
