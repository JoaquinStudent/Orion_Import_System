package com.orionlogistic.api.estados;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.estados.dto.EstadoRequest;
import com.orionlogistic.api.estados.dto.EstadoResponse;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estados")
@RequiredArgsConstructor
public class EstadoController {

    private final EstadoService estadoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EstadoResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(estadoService.listar()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EstadoResponse>> crear(
            @Valid @RequestBody EstadoRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        EstadoResponse data = estadoService.crear(req, usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "Estado creado"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EstadoResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EstadoRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        EstadoResponse data = estadoService.actualizar(id, req, usuario);
        return ResponseEntity.ok(ApiResponse.ok(data, "Estado actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        estadoService.eliminar(id, usuario);
        return ResponseEntity.ok(ApiResponse.ok(null, "Estado eliminado"));
    }
}
