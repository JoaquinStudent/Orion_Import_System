package com.orionlogistic.api.finanzas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * GET /finanzas/kpis → tarjetas de KPI del panel de finanzas (doc 05c).
 * Los ingresos consideran solo pedidos con estado_pago = 'liquidado'.
 * `mejorMes` es el número de mes (1-12) con mayor ingreso del año, o null.
 */
@Getter @AllArgsConstructor
public class FinanzasKpisResponse {

    private BigDecimal ingresoHoyUsd;
    private BigDecimal ingresoAyerUsd;
    private BigDecimal ingresoMesUsd;
    private long pedidosMes;
    private BigDecimal ingresoAnioUsd;
    private Integer mejorMes;
}
