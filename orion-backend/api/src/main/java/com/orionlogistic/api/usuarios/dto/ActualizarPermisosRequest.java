package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Body de PUT /usuarios/{id}/permisos. */
@Getter @Setter
public class ActualizarPermisosRequest {

    @NotNull
    @Valid
    private List<PermisoInput> permisos = new ArrayList<>();
}
