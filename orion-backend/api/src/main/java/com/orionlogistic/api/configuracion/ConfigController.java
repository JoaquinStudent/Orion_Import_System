package com.orionlogistic.api.configuracion;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.configuracion.dto.ConfigPublicaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Configuración pública del negocio (doc 05.10). */
@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfiguracionService configuracion;

    @GetMapping("/publica")
    public ResponseEntity<ApiResponse<ConfigPublicaResponse>> publica() {
        return ResponseEntity.ok(ApiResponse.ok(configuracion.construirPublica()));
    }
}
