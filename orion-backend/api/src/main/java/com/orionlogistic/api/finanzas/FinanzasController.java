package com.orionlogistic.api.finanzas;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.finanzas.dto.FinanzasKpisResponse;
import com.orionlogistic.api.finanzas.dto.FinanzasResumenResponse;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/** Finanzas: resumen de ingresos + exportación a Excel (doc 05.7). */
@RestController
@RequestMapping("/finanzas")
@RequiredArgsConstructor
public class FinanzasController {

    private static final String XLSX_MIME =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final FinanzasService finanzasService;

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<FinanzasResumenResponse>> resumen(
            @RequestParam(name = "periodo", required = false) String periodo,
            @RequestParam(name = "desde", required = false) String desde,
            @RequestParam(name = "hasta", required = false) String hasta,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(
                ApiResponse.ok(finanzasService.resumen(periodo, desde, hasta, usuario)));
    }

    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<FinanzasKpisResponse>> kpis(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(finanzasService.kpis(usuario)));
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(name = "desde", required = false) String desde,
            @RequestParam(name = "hasta", required = false) String hasta,
            @AuthenticationPrincipal Usuario usuario) {
        byte[] xlsx = finanzasService.exportar(desde, hasta, usuario);
        String nombre = "finanzas-orion-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + "\"")
                .contentType(MediaType.parseMediaType(XLSX_MIME))
                .body(xlsx);
    }
}
