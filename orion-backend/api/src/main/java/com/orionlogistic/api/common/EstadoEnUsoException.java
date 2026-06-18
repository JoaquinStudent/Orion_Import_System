package com.orionlogistic.api.common;

/** Intento de borrar un estado con pedidos asignados → 409 ESTADO_EN_USO (doc 05b). */
public class EstadoEnUsoException extends RuntimeException {
    public EstadoEnUsoException(String message) {
        super(message);
    }
}
