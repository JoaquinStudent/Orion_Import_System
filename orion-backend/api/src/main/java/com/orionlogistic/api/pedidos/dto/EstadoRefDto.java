package com.orionlogistic.api.pedidos.dto;

import com.orionlogistic.api.estados.Estado;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Estado anidado dentro de un pedido: { id, nombre, color } (doc 05b, decisión 1). */
@Getter @AllArgsConstructor
public class EstadoRefDto {

    private Long id;
    private String nombre;
    private String color;

    public static EstadoRefDto from(Estado estado) {
        if (estado == null) {
            return null;
        }
        return new EstadoRefDto(estado.getId(), estado.getNombre(), estado.getColor());
    }
}
