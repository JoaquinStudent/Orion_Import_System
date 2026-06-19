package com.orionlogistic.api.comunidades.dto;

import com.orionlogistic.api.comunidades.Comunidad;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Comunidad como la devuelve la API: { id, nombre, activo }. */
@Getter @AllArgsConstructor
public class ComunidadResponse {

    private Long id;
    private String nombre;
    private boolean activo;

    public static ComunidadResponse from(Comunidad c) {
        return new ComunidadResponse(c.getId(), c.getNombre(),
                Boolean.TRUE.equals(c.getActivo()));
    }
}
