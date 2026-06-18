package com.orionlogistic.api.estados.dto;

import com.orionlogistic.api.estados.Estado;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Estado tal como lo devuelve la API (GET /estados, doc 05b). */
@Getter @AllArgsConstructor
public class EstadoResponse {

    private Long id;
    private String nombre;
    private Integer orden;
    private String color;

    public static EstadoResponse from(Estado estado) {
        return new EstadoResponse(
                estado.getId(),
                estado.getNombre(),
                estado.getOrden(),
                estado.getColor());
    }
}
