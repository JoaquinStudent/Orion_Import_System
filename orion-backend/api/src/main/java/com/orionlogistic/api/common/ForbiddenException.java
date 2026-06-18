package com.orionlogistic.api.common;

/** Logueado pero sin permiso del módulo → 403 SIN_PERMISO (doc 05b). */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
