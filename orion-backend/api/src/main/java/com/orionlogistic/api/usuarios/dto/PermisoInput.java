package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/** Permiso por módulo dentro de PUT /usuarios/{id}/permisos. */
@Getter @Setter
public class PermisoInput {

    @NotBlank
    @Pattern(regexp = "pedidos|tablero|finanzas|cotizador|configuracion")
    private String modulo;

    private boolean puedeVer;
    private boolean puedeEditar;
}
