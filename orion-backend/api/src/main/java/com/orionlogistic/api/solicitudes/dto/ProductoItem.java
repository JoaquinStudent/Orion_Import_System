package com.orionlogistic.api.solicitudes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Línea de producto de una solicitud. Se persiste como JSON y se valida en el request. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProductoItem {

    @NotNull @Min(1)
    private Integer cantidad;

    @NotBlank @Size(max = 200)
    private String producto;

    @Size(max = 100)
    private String marca;
}
