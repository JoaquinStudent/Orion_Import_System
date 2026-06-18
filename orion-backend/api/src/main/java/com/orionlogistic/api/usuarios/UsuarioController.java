package com.orionlogistic.api.usuarios;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.usuarios.dto.ActualizarPermisosRequest;
import com.orionlogistic.api.usuarios.dto.CambiarEstadoUsuarioRequest;
import com.orionlogistic.api.usuarios.dto.CrearUsuarioRequest;
import com.orionlogistic.api.usuarios.dto.UsuarioResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Administración de usuarios y permisos. Restringido a ADMIN por SecurityConfig
 * (`/usuarios/**` → hasRole("ADMIN")).
 */
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.listar()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> crear(
            @Valid @RequestBody CrearUsuarioRequest req) {
        UsuarioResponse data = usuarioService.crear(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "Usuario creado"));
    }

    @PutMapping("/{id}/permisos")
    public ResponseEntity<ApiResponse<Void>> actualizarPermisos(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPermisosRequest req) {
        usuarioService.actualizarPermisos(id, req);
        return ResponseEntity.ok(ApiResponse.ok(null, "Permisos actualizados"));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<UsuarioResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoUsuarioRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok(usuarioService.cambiarEstado(id, req.getActivo()),
                        "Estado del usuario actualizado"));
    }
}
