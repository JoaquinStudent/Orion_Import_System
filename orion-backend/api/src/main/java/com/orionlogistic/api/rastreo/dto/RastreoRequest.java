package com.orionlogistic.api.rastreo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** POST /rastreo: { num_tracking, num_orden }. Endpoint público → acotar tamaño. */
@Getter @Setter
public class RastreoRequest {

    @NotBlank @Size(max = 50)
    private String numTracking;

    @NotBlank @Size(max = 50)
    private String numOrden;
}
