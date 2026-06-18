package com.orionlogistic.api.usuarios.dto;

import com.orionlogistic.api.usuarios.Permiso;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Permiso por módulo: { modulo, puede_ver, puede_editar }. */
@Getter @AllArgsConstructor
public class PermisoDto {

    private String modulo;
    private boolean puedeVer;
    private boolean puedeEditar;

    public static PermisoDto from(Permiso p) {
        return new PermisoDto(
                p.getModulo(),
                Boolean.TRUE.equals(p.getPuedeVer()),
                Boolean.TRUE.equals(p.getPuedeEditar()));
    }
}
