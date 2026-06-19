package com.orionlogistic.api.rastreo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** POST /rastreo: { num_tracking, num_orden }. */
@Getter @Setter
public class RastreoRequest {

    @NotBlank
    private String numTracking;

    @NotBlank
    private String numOrden;
}
