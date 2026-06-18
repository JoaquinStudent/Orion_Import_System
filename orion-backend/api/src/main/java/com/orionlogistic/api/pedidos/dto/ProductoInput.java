package com.orionlogistic.api.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Línea de producto al crear/editar un pedido (sin id). */
@Getter @Setter
public class ProductoInput {

    @NotNull @Min(1)
    private Integer cantidad;

    @NotBlank @Size(max = 200)
    private String producto;

    @Size(max = 100)
    private String marca;
}
