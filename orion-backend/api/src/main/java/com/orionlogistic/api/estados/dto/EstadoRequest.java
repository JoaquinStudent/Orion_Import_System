package com.orionlogistic.api.estados.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Payload para crear/editar un estado (POST/PUT /estados, doc 05b). */
@Getter @Setter
public class EstadoRequest {

    @NotBlank
    @Size(max = 50)
    private String nombre;

    @NotNull
    private Integer orden;

    @Size(max = 7)
    private String color;
}
