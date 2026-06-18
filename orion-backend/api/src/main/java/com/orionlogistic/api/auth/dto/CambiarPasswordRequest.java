package com.orionlogistic.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CambiarPasswordRequest {
    @NotBlank
    private String passwordActual;

    @NotBlank @Size(min = 8)
    private String passwordNueva;
}
