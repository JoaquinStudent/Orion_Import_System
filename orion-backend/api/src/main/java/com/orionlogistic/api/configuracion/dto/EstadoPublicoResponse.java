package com.orionlogistic.api.configuracion.dto;

import com.orionlogistic.api.estados.Estado;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Estado expuesto en GET /config/publica para la landing: solo datos no sensibles
 * (nombre, color, orden). Sin `id` ni nada del endpoint admin de estados (doc 05d.7).
 */
@Getter @AllArgsConstructor
public class EstadoPublicoResponse {

    private String nombre;
    private String color;
    private Integer orden;

    public static EstadoPublicoResponse from(Estado e) {
        return new EstadoPublicoResponse(e.getNombre(), e.getColor(), e.getOrden());
    }
}
