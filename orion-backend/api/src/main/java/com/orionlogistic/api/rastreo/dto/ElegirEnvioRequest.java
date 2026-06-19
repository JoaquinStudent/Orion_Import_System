package com.orionlogistic.api.rastreo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/** PATCH /rastreo/tipo-envio: { num_tracking, num_orden, tipo_envio }. */
@Getter @Setter
public class ElegirEnvioRequest {

    @NotBlank
    private String numTracking;

    @NotBlank
    private String numOrden;

    @NotBlank
    @Pattern(regexp = "almacen|lima|shalom", message = "debe ser almacen, lima o shalom")
    private String tipoEnvio;
}
