package com.orionlogistic.api.cotizador;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.cotizador.dto.ActualizarCotizadorConfigRequest;
import com.orionlogistic.api.cotizador.dto.CotizadorConfigResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Configuración del cotizador (doc 05.6). Bajo /admin/** → solo ADMIN
 * (SecurityConfig). El front llama PUT /admin/cotizador/config.
 */
@RestController
@RequestMapping("/admin/cotizador")
@RequiredArgsConstructor
public class CotizadorAdminController {

    private final CotizadorService cotizadorService;

    @PutMapping("/config")
    public ResponseEntity<ApiResponse<CotizadorConfigResponse>> actualizarConfig(
            @Valid @RequestBody ActualizarCotizadorConfigRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok(cotizadorService.actualizarConfig(req), "Configuración actualizada"));
    }
}
