package com.orionlogistic.api.common;

/** Se intenta borrar un estado que tiene pedidos asignados → 409 ESTADO_EN_USO. */
public class EstadoEnUsoException extends RuntimeException {
    public EstadoEnUsoException(String message) {
        super(message);
    }
}
