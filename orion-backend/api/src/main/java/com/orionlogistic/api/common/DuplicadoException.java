package com.orionlogistic.api.common;

/** num_orden / num_tracking / email repetido → 409 DUPLICADO (doc 05b). */
public class DuplicadoException extends RuntimeException {
    public DuplicadoException(String message) {
        super(message);
    }
}
