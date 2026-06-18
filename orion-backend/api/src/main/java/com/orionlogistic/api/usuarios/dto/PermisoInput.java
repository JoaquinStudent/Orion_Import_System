package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/** Línea de permiso al asignar permisos a un empleado (PUT /usuarios/{id}/permisos). */
@Getter @Setter
public class PermisoInput {

    @NotNull
    @Pattern(regexp = "pedidos|tablero|finanzas|cotizador|configuracion",
            message = "módulo inválido")
    private String modulo;

    @NotNull
    private Boolean puedeVer;

    @NotNull
    private Boolean puedeEditar;
}
