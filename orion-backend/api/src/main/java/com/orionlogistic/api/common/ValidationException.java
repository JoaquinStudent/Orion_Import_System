package com.orionlogistic.api.common;

/**
 * Error de validación de negocio (dato inválido pero NO de autenticación)
 * → 400 VALIDATION. Se usa, por ejemplo, cuando la contraseña actual enviada
 * a cambiar-password no coincide: debe ser 400 (no 401) para que el front no
 * interprete la respuesta como sesión vencida y expulse al usuario.
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
