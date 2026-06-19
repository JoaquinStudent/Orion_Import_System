package com.orionlogistic.api.configuracion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** PUT /admin/config — config general del negocio (WhatsApp, nombre, archivado). */
@Getter @Setter
public class ActualizarConfigRequest {

    @Size(max = 20)
    private String whatsappAtencion;

    @Size(max = 100)
    private String nombreNegocio;

    @Min(1)
    private Integer diasArchivoEntregados;
}
