package com.orionlogistic.api.finanzas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * GET /finanzas/resumen → { ingreso_total_usd, total_pedidos, serie,
 * desglose_tipo_envio } (doc 05.7 / 05c). `desglose_tipo_envio` es aditivo:
 * cuenta los pedidos del rango por tipo de envío (incluye los sin asignar,
 * con tipo_envio = null).
 */
@Getter @AllArgsConstructor
public class FinanzasResumenResponse {

    private BigDecimal ingresoTotalUsd;
    private long totalPedidos;
    private List<Punto> serie;
    private List<DesgloseTipoEnvio> desgloseTipoEnvio;

    /** Un punto de la serie temporal de ingresos. */
    @Getter @AllArgsConstructor
    public static class Punto {
        private String fecha;
        private BigDecimal ingresoUsd;
    }

    /** Cantidad de pedidos del rango por tipo de envío (tipo_envio null = sin asignar). */
    @Getter @AllArgsConstructor
    public static class DesgloseTipoEnvio {
        private String tipoEnvio;
        private long cantidad;
    }
}
