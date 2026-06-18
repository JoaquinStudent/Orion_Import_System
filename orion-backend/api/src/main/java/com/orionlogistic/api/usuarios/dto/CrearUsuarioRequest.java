package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Alta de usuario (POST /usuarios, solo ADMIN, doc 05b).
 * `password_temporal` es la contraseña inicial que el empleado deberá cambiar
 * en su primer login (el usuario se crea con passwordTemporal=true).
 */
@Getter @Setter
public class CrearUsuarioRequest {

    @NotBlank @Size(max = 100)
    private String nombre;

    @NotBlank @Email @Size(max = 150)
    private String email;

    @Pattern(regexp = "ADMIN|EMPLEADO", message = "debe ser ADMIN o EMPLEADO")
    private String rol;

    @NotBlank @Size(min = 6, max = 100)
    private String passwordTemporal;

    @Size(max = 7)
    private String avatarColor;
}
