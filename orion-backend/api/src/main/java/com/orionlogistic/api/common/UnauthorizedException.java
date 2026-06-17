package com.orionlogistic.api.common;

/**
 * Error de autenticación (credenciales inválidas, usuario desactivado).
 * El GlobalExceptionHandler lo mapea a HTTP 401, según el doc 05.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
