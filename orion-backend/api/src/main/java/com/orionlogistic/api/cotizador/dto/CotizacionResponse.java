package com.orionlogistic.api.cotizador.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Resultado de POST /cotizador/calcular. Es una "unión" discriminada por
 * `aplica_calculo` (doc 05.5): con true van los campos del desglose; con false
 * va mensaje + whatsapp. Los nulos se omiten para no mezclar ambas formas.
 */
@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CotizacionResponse {

    private final boolean aplicaCalculo;

    // --- aplica_calculo = true ---
    private final BigDecimal valorUsd;
    private final BigDecimal pesoRealKg;
    private final Integer pesoCobradoKg;
    private final BigDecimal fleteUsd;
    private final BigDecimal desaduanajeUsd;
    private final BigDecimal totalUsd;
    private final BigDecimal tipoCambio;
    private final BigDecimal totalPen;

    // --- aplica_calculo = false ---
    private final String mensaje;
    private final String whatsappAtencion;

    public static CotizacionResponse calculo(BigDecimal valorUsd, BigDecimal pesoRealKg,
            Integer pesoCobradoKg, BigDecimal fleteUsd, BigDecimal desaduanajeUsd,
            BigDecimal totalUsd, BigDecimal tipoCambio, BigDecimal totalPen) {
        return new CotizacionResponse(true, valorUsd, pesoRealKg, pesoCobradoKg, fleteUsd,
                desaduanajeUsd, totalUsd, tipoCambio, totalPen, null, null);
    }

    public static CotizacionResponse asesor(String mensaje, String whatsappAtencion) {
        return new CotizacionResponse(false, null, null, null, null, null, null, null, null,
                mensaje, whatsappAtencion);
    }
}
