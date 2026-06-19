package com.orionlogistic.api.auth;

import com.orionlogistic.api.auth.dto.CambiarPasswordRequest;
import com.orionlogistic.api.auth.dto.LoginRequest;
import com.orionlogistic.api.auth.dto.LoginResponse;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.UnauthorizedException;
import com.orionlogistic.api.common.ValidationException;
import com.orionlogistic.api.usuarios.PermisoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import com.orionlogistic.api.usuarios.UsuarioRepository;
import com.orionlogistic.api.usuarios.dto.PermisoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository
                .findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() ->
                        new UnauthorizedException("Credenciales inválidas"));

        if (!usuario.getActivo()) {
            throw new UnauthorizedException("Usuario desactivado");
        }

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(
                usuario.getId(), usuario.getEmail(), usuario.getRol());

        return new LoginResponse(token, construirUsuarioDto(usuario));
    }

    /** Datos del usuario autenticado para GET /auth/me (mismo shape que el login). */
    public LoginResponse.UsuarioDto me(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Sesión inválida"));
        return construirUsuarioDto(usuario);
    }

    /**
     * Arma el UsuarioDto incluyendo sus permisos por módulo.
     * ADMIN tiene acceso total implícito → permisos vacío (doc 05b).
     */
    private LoginResponse.UsuarioDto construirUsuarioDto(Usuario usuario) {
        List<PermisoDto> permisos = "ADMIN".equals(usuario.getRol())
                ? List.of()
                : permisoRepository.findByUsuarioId(usuario.getId()).stream()
                        .map(PermisoDto::from)
                        .toList();
        return new LoginResponse.UsuarioDto(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getAvatarColor(),
                usuario.getPasswordTemporal(),
                permisos);
    }

    public void cambiarPassword(Long userId, CambiarPasswordRequest req) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // 400 (no 401): un 401 haría que el interceptor del front cierre la
        // sesión y expulse al usuario de la pantalla de cambio de contraseña.
        if (!passwordEncoder.matches(req.getPasswordActual(),
                usuario.getPasswordHash())) {
            throw new ValidationException("La contraseña actual es incorrecta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(req.getPasswordNueva()));
        usuario.setPasswordTemporal(false);
        usuarioRepository.save(usuario);
    }
}