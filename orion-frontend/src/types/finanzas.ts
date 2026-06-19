/** Un punto de la serie de ingresos (GET /finanzas/resumen, doc 05.7). */
export interface FinanzasPunto {
  fecha: string;
  ingreso_usd: number;
}

/** Desglose de pedidos por tipo de envío (tipo_envio: null = "Sin asignar"). */
export interface DesgloseTipoEnvio {
  tipo_envio: "almacen" | "lima" | "shalom" | null;
  cantidad: number;
}

/** Resumen financiero: totales + serie temporal de ingresos en USD. */
export interface FinanzasResumen {
  ingreso_total_usd: number;
  total_pedidos: number;
  serie: FinanzasPunto[];
  desglose_tipo_envio?: DesgloseTipoEnvio[];
}

/** Tarjetas KPI de finanzas (GET /finanzas/kpis). Ingresos = solo liquidado. */
export interface FinanzasKpis {
  ingreso_hoy_usd: number;
  ingreso_ayer_usd: number;
  ingreso_mes_usd: number;
  pedidos_mes: number;
  ingreso_anio_usd: number;
  /** Mes 1–12 con mayor ingreso del año, o null si no hay ingresos. */
  mejor_mes: number | null;
}

/** Filtros del resumen de finanzas. */
export interface FinanzasQuery {
  periodo?: "dia" | "mes" | "anio";
  desde?: string;
  hasta?: string;
}
