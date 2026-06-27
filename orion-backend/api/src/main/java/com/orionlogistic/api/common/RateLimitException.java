package com.orionlogistic.api.common;

/** Se superó un límite de uso (p. ej. registros públicos por día) → 429 LIMITE_DIARIO. */
public class RateLimitException extends RuntimeException {
    public RateLimitException(String message) {
        super(message);
    }
}
