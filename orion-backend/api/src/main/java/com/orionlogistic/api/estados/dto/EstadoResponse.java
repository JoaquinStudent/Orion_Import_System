package com.orionlogistic.api.estados.dto;

import com.orionlogistic.api.estados.Estado;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Estado completo: { id, nombre, orden, color }. */
@Getter @AllArgsConstructor
public class EstadoResponse {

    private Long id;
    private String nombre;
    private Integer orden;
    private String color;

    public static EstadoResponse from(Estado e) {
        return new EstadoResponse(e.getId(), e.getNombre(), e.getOrden(), e.getColor());
    }
}
