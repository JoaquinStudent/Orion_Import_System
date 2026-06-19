package com.orionlogistic.api.rastreo;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.rastreo.dto.ElegirEnvioRequest;
import com.orionlogistic.api.rastreo.dto.RastreoRequest;
import com.orionlogistic.api.rastreo.dto.RastreoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Rastreo público del cliente (doc 05.9). Sin autenticación. */
@RestController
@RequestMapping("/rastreo")
@RequiredArgsConstructor
public class RastreoController {

    private final RastreoService rastreoService;

    @PostMapping
    public ResponseEntity<ApiResponse<RastreoResponse>> rastrear(
            @Valid @RequestBody RastreoRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok(rastreoService.rastrear(req.getNumTracking(), req.getNumOrden())));
    }

    @PatchMapping("/tipo-envio")
    public ResponseEntity<ApiResponse<RastreoResponse>> elegirTipoEnvio(
            @Valid @RequestBody ElegirEnvioRequest req) {
        RastreoResponse data = rastreoService.elegirTipoEnvio(
                req.getNumTracking(), req.getNumOrden(), req.getTipoEnvio());
        return ResponseEntity.ok(ApiResponse.ok(data, "Tipo de envío confirmado"));
    }
}
