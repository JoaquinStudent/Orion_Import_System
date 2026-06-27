package com.orionlogistic.api.comunidades;

import com.orionlogistic.api.comunidades.dto.ComunidadRequest;
import com.orionlogistic.api.comunidades.dto.ComunidadResponse;
import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Catálogo de comunidades. GET es para cualquier usuario autenticado (llena el
 * combobox del alta de pedido); el ABM exige permiso "configuracion" (ADMIN).
 */
@RestController
@RequestMapping("/comunidades")
@RequiredArgsConstructor
public class ComunidadController {

    private final ComunidadService comunidadService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ComunidadResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(comunidadService.listar()));
    }

    /** Público (registro de clientes): solo nombres de comunidades activas. */
    @GetMapping("/publicas")
    public ResponseEntity<ApiResponse<List<String>>> listarPublicas() {
        return ResponseEntity.ok(ApiResponse.ok(comunidadService.listarPublicas()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ComunidadResponse>> crear(
            @Valid @RequestBody ComunidadRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        ComunidadResponse data = comunidadService.crear(req, usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "Comunidad creada"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ComunidadResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ComunidadRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(
                ApiResponse.ok(comunidadService.actualizar(id, req, usuario), "Comunidad actualizada"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        comunidadService.eliminar(id, usuario);
        return ResponseEntity.ok(ApiResponse.ok(null, "Comunidad eliminada"));
    }
}
