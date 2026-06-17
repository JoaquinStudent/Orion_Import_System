package com.orionlogistic.api.auth;

import com.orionlogistic.api.auth.dto.CambiarPasswordRequest;
import com.orionlogistic.api.auth.dto.LoginRequest;
import com.orionlogistic.api.auth.dto.LoginResponse;
import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        LoginResponse data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok(data, "Inicio de sesión exitoso"));
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CambiarPasswordRequest req) {
        authService.cambiarPassword(usuario.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok(null, "Contraseña actualizada"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT es stateless: el logout lo maneja el frontend borrando el token.
        return ResponseEntity.ok(ApiResponse.ok(null, "Sesión cerrada"));
    }
}
