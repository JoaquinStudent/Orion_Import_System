package com.orionlogistic.api.configuracion;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.configuracion.dto.ActualizarConfigRequest;
import com.orionlogistic.api.configuracion.dto.ConfigPublicaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Config general del negocio (doc 05.10). Bajo /admin/** → solo ADMIN. */
@RestController
@RequestMapping("/admin/config")
@RequiredArgsConstructor
public class ConfigAdminController {

    private final ConfiguracionService configuracion;

    @PutMapping
    public ResponseEntity<ApiResponse<ConfigPublicaResponse>> actualizar(
            @Valid @RequestBody ActualizarConfigRequest req) {
        if (req.getWhatsappAtencion() != null) {
            configuracion.set(ConfiguracionService.WHATSAPP_ATENCION, req.getWhatsappAtencion());
        }
        if (req.getNombreNegocio() != null) {
            configuracion.set(ConfiguracionService.NOMBRE_NEGOCIO, req.getNombreNegocio());
        }
        if (req.getDiasArchivoEntregados() != null) {
            configuracion.set(ConfiguracionService.DIAS_ARCHIVO_ENTREGADOS,
                    String.valueOf(req.getDiasArchivoEntregados()));
        }
        return ResponseEntity.ok(
                ApiResponse.ok(configuracion.construirPublica(), "Configuración actualizada"));
    }
}
