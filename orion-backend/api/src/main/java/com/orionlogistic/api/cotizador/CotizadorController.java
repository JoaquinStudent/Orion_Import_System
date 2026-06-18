package com.orionlogistic.api.cotizador;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.cotizador.dto.CotizacionResponse;
import com.orionlogistic.api.cotizador.dto.CotizadorConfigResponse;
import com.orionlogistic.api.cotizador.dto.CotizarRequest;
import com.orionlogistic.api.cotizador.dto.TipoCambioResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Cotizador público (doc 05.5). Sin autenticación. */
@RestController
@RequestMapping("/cotizador")
@RequiredArgsConstructor
public class CotizadorController {

    private final CotizadorService cotizadorService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<CotizadorConfigResponse>> config() {
        return ResponseEntity.ok(ApiResponse.ok(cotizadorService.obtenerConfig()));
    }

    @GetMapping("/tipo-cambio")
    public ResponseEntity<ApiResponse<TipoCambioResponse>> tipoCambio() {
        return ResponseEntity.ok(ApiResponse.ok(cotizadorService.tipoCambio()));
    }

    @PostMapping("/calcular")
    public ResponseEntity<ApiResponse<CotizacionResponse>> calcular(
            @Valid @RequestBody CotizarRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok(cotizadorService.calcular(req.getValorUsd(), req.getPesoKg())));
    }
}
