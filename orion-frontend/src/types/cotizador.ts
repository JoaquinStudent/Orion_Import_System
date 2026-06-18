/** Configuración del cotizador (GET /cotizador/config, doc 05.5). */
export interface CotizadorConfig {
  flete_por_kilo: number;
  desaduanaje: number;
  umbral_asesor: number;
  whatsapp_atencion: string;
}

/** Payload del admin para editar el cotizador (PUT /admin/cotizador/config, 05.6). */
export interface CotizadorConfigInput {
  flete_por_kilo: number;
  desaduanaje: number;
}

/** Request del cálculo público (POST /cotizador/calcular). */
export interface CotizacionInput {
  valor_usd: number;
  peso_kg: number;
}

/** Resultado cuando el envío califica para cálculo automático (valor < umbral). */
export interface CotizacionCalculo {
  aplica_calculo: true;
  valor_usd: number;
  peso_real_kg: number;
  peso_cobrado_kg: number;
  flete_usd: number;
  desaduanaje_usd: number;
  total_usd: number;
  tipo_cambio: number;
  total_pen: number;
}

/** Resultado cuando el envío supera el umbral → derivar a un asesor. */
export interface CotizacionAsesor {
  aplica_calculo: false;
  mensaje: string;
  whatsapp_atencion: string;
}

export type CotizacionResult = CotizacionCalculo | CotizacionAsesor;

/** Tipo de cambio USD→PEN (GET /cotizador/tipo-cambio). */
export interface TipoCambio {
  usd_pen: number;
  actualizado: string;
}
