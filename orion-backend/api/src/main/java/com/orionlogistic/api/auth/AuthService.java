package com.orionlogistic.api.auth;

import com.orionlogistic.api.auth.dto.CambiarPasswordRequest;
import com.orionlogistic.api.auth.dto.LoginRequest;
import com.orionlogistic.api.auth.dto.LoginResponse;
import com.orionlogistic.api.usuarios.Usuario;
import com.orionlogistic.api.usuarios.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository
                .findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("Credenciales inválidas"));

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario desactivado");
        }

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(
                usuario.getId(), usuario.getEmail(), usuario.getRol());

        return new LoginResponse(token,
                new LoginResponse.UsuarioDto(
                        usuario.getId(),
                        usuario.getNombre(),
                        usuario.getRol(),
                        usuario.getPasswordTemporal()
                ));
    }

    public void cambiarPassword(Long userId, CambiarPasswordRequest req) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(req.getPasswordActual(),
                usuario.getPasswordHash())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(req.getPasswordNueva()));
        usuario.setPasswordTemporal(false);
        usuarioRepository.save(usuario);
    }
}