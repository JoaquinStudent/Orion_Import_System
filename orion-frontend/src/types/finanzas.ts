/** Un punto de la serie de ingresos (GET /finanzas/resumen, doc 05.7). */
export interface FinanzasPunto {
  fecha: string;
  ingreso_usd: number;
}

/** Resumen financiero: totales + serie temporal de ingresos en USD. */
export interface FinanzasResumen {
  ingreso_total_usd: number;
  total_pedidos: number;
  serie: FinanzasPunto[];
}

/** Filtros del resumen de finanzas. */
export interface FinanzasQuery {
  periodo?: "dia" | "mes" | "anio";
  desde?: string;
  hasta?: string;
}
