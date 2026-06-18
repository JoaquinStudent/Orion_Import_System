package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/** Body de POST /usuarios (crea un empleado/admin con contraseña temporal, doc 05b). */
@Getter @Setter
public class CrearUsuarioRequest {

    @NotBlank @Size(max = 100)
    private String nombre;

    @NotBlank @Email @Size(max = 150)
    private String email;

    @NotBlank
    @Pattern(regexp = "ADMIN|EMPLEADO", message = "debe ser ADMIN o EMPLEADO")
    private String rol;

    /** Contraseña temporal inicial (se hashea; el usuario la cambia al primer login). */
    @NotBlank @Size(min = 6)
    private String passwordTemporal;

    @Size(max = 7)
    private String avatarColor;
}
