package com.orionlogistic.api.cotizador.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** Request del cálculo público (POST /cotizador/calcular). */
@Getter @Setter
public class CotizarRequest {

    @NotNull @PositiveOrZero
    private BigDecimal valorUsd;

    @NotNull @Positive
    private BigDecimal pesoKg;
}
