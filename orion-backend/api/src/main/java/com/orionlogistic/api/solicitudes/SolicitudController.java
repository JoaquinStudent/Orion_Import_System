package com.orionlogistic.api.solicitudes;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.common.PageResponse;
import com.orionlogistic.api.pedidos.dto.PedidoDetailResponse;
import com.orionlogistic.api.solicitudes.dto.SolicitudPublicaRequest;
import com.orionlogistic.api.solicitudes.dto.SolicitudResponse;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Registro de pedidos por clientes. POST es público (lo usa la landing); el resto
 * (bandeja de revisión, aprobar, rechazar) exige permiso de "pedidos".
 */
@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    /** Público: el cliente registra su pedido desde la landing. */
    @PostMapping
    public ResponseEntity<ApiResponse<SolicitudResponse>> crear(
            @Valid @RequestBody SolicitudPublicaRequest req,
            HttpServletRequest http) {
        SolicitudResponse data = solicitudService.crearPublica(req, clientIp(http));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                data, "Tu solicitud fue recibida. La revisaremos antes de procesarla."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SolicitudResponse>>> listar(
            @RequestParam(name = "estado", required = false) String estado,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(
                ApiResponse.ok(solicitudService.listar(estado, page, size, usuario)));
    }

    @GetMapping("/pendientes/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> contarPendientes(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("pendientes", solicitudService.contarPendientes(usuario))));
    }

    @PostMapping("/{id}/aprobar")
    public ResponseEntity<ApiResponse<PedidoDetailResponse>> aprobar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(
                solicitudService.aprobar(id, usuario), "Solicitud aprobada y pedido creado"));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<ApiResponse<SolicitudResponse>> rechazar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(
                solicitudService.rechazar(id, usuario), "Solicitud rechazada"));
    }

    /** IP real detrás de Cloudflare/Railway (X-Forwarded-For) con fallback al socket. */
    private String clientIp(HttpServletRequest http) {
        String xff = http.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xff)) {
            return xff.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
