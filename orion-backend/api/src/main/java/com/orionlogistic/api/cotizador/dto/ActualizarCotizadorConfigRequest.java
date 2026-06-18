package com.orionlogistic.api.cotizador.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** PUT /admin/cotizador/config → { flete_por_kilo, desaduanaje } (doc 05.6). */
@Getter @Setter
public class ActualizarCotizadorConfigRequest {

    @NotNull @PositiveOrZero
    private BigDecimal fletePorKilo;

    @NotNull @PositiveOrZero
    private BigDecimal desaduanaje;
}
