package com.orionlogistic.api.configuracion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * GET /config/publica →
 * { whatsapp_atencion, nombre_negocio, dias_archivo_entregados, estados[] }.
 * `estados` (nombre/color/orden) alimenta la línea de estados de la landing (doc 05d.7).
 */
@Getter @AllArgsConstructor
public class ConfigPublicaResponse {
    private String whatsappAtencion;
    private String nombreNegocio;
    private Integer diasArchivoEntregados;
    private List<EstadoPublicoResponse> estados;
}
