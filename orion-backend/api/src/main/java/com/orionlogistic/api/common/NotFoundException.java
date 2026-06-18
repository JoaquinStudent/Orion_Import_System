package com.orionlogistic.api.common;

/** Recurso inexistente → 404 NO_ENCONTRADO (doc 05b). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
