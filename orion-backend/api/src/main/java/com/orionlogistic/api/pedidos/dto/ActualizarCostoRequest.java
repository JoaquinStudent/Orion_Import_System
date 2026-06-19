package com.orionlogistic.api.pedidos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** Body de PATCH /pedidos/{id}/costo: { costo_importacion_usd }. Debe ser > 0. */
@Getter @Setter
public class ActualizarCostoRequest {

    @NotNull @Positive
    private BigDecimal costoImportacionUsd;
}
