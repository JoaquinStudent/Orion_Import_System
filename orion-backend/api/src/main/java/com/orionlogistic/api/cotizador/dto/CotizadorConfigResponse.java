package com.orionlogistic.api.cotizador.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/** GET /cotizador/config → { flete_por_kilo, desaduanaje, umbral_asesor, whatsapp_atencion }. */
@Getter @AllArgsConstructor
public class CotizadorConfigResponse {
    private BigDecimal fletePorKilo;
    private BigDecimal desaduanaje;
    private int umbralAsesor;
    private String whatsappAtencion;
}
