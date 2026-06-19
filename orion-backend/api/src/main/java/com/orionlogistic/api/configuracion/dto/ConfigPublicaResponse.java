package com.orionlogistic.api.configuracion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** GET /config/publica → { whatsapp_atencion, nombre_negocio, dias_archivo_entregados }. */
@Getter @AllArgsConstructor
public class ConfigPublicaResponse {
    private String whatsappAtencion;
    private String nombreNegocio;
    private Integer diasArchivoEntregados;
}
