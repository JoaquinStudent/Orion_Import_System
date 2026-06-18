package com.orionlogistic.api.pedidos.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Body de PATCH /pedidos/{id}/estado: { estado_id }. */
@Getter @Setter
public class CambiarEstadoRequest {

    @NotNull
    private Long estadoId;
}
