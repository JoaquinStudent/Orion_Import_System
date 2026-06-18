package com.orionlogistic.api.configuracion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** GET /config/publica → { whatsapp_atencion, nombre_negocio } (doc 05.10). */
@Getter @AllArgsConstructor
public class ConfigPublicaResponse {
    private String whatsappAtencion;
    private String nombreNegocio;
}
