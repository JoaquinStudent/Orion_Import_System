package com.orionlogistic.api.common;

/** Autenticado pero sin permiso sobre el módulo → 403 SIN_PERMISO. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
