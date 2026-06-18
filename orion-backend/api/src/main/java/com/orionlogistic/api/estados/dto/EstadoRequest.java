package com.orionlogistic.api.estados.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Payload para crear o editar un estado (POST/PUT /estados). */
@Getter @Setter
public class EstadoRequest {

    @NotBlank @Size(max = 50)
    private String nombre;

    @NotNull
    private Integer orden;

    @Size(max = 7)
    private String color;
}
