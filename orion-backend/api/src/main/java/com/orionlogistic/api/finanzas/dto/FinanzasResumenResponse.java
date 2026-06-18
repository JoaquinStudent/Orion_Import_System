package com.orionlogistic.api.finanzas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/** GET /finanzas/resumen → { ingreso_total_usd, total_pedidos, serie } (doc 05.7). */
@Getter @AllArgsConstructor
public class FinanzasResumenResponse {

    private BigDecimal ingresoTotalUsd;
    private long totalPedidos;
    private List<Punto> serie;

    /** Un punto de la serie temporal de ingresos. */
    @Getter @AllArgsConstructor
    public static class Punto {
        private String fecha;
        private BigDecimal ingresoUsd;
    }
}
