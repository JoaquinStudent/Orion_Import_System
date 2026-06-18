package com.orionlogistic.api.usuarios.dto;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Body de PUT /usuarios/{id}/permisos: { permisos: [...] }. */
@Getter @Setter
public class ActualizarPermisosRequest {

    @Valid
    private List<PermisoInput> permisos = new ArrayList<>();
}
