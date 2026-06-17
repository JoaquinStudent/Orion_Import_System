package com.orionlogistic.api.common;

import lombok.Getter;

@Getter
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