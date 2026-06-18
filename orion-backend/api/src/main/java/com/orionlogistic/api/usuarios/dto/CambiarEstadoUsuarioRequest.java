package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Body de PATCH /usuarios/{id}/estado: { activo }. */
@Getter @Setter
public class CambiarEstadoUsuarioRequest {

    @NotNull
    private Boolean activo;
}
