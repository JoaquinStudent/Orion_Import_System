package com.orionlogistic.api.common;

/** Viola una restricción UNIQUE (num_orden, num_tracking, email) → 409 DUPLICADO. */
public class DuplicadoException extends RuntimeException {
    public DuplicadoException(String message) {
        super(message);
    }
}
