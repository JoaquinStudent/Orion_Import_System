package com.orionlogistic.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

/**
 * Contrato de respuestas de la API (SDD doc 05.1).
 * Éxito: { success: true, data, message? }
 * Error: { success: false, error, code? }
 * Los campos null se omiten del JSON para no mezclar ambas formas.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final String error;
    private final String code;

    private ApiResponse(boolean success, T data, String message,
                        String error, String code) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.error = error;
        this.code = code;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message, null, null);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, "Operación exitosa");
    }

    public static <T> ApiResponse<T> error(String error, String code) {
        return new ApiResponse<>(false, null, null, error, code);
    }
}