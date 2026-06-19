package com.orionlogistic.api.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/** Body de PATCH /pedidos/{id}/pago: { estado_pago }. */
@Getter @Setter
public class CambiarPagoRequest {

    @NotBlank
    @Pattern(regexp = "pendiente|liquidado", message = "debe ser pendiente o liquidado")
    private String estadoPago;
}
