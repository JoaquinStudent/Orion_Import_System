package com.orionlogistic.api.cotizador.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

/** GET /cotizador/tipo-cambio → { usd_pen, actualizado }. */
@Getter @AllArgsConstructor
public class TipoCambioResponse {
    private BigDecimal usdPen;
    private Instant actualizado;
}
