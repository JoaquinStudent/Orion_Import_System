package com.orionlogistic.api.comunidades.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Payload para crear/editar una comunidad (POST/PUT /comunidades). */
@Getter @Setter
public class ComunidadRequest {

    @NotBlank @Size(max = 100)
    private String nombre;
}
