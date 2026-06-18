package com.orionlogistic.api.usuarios;

import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.usuarios.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final String AVATAR_DEFAULT = "#1B2A5E";

    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest req) {
        String email = req.getEmail().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new DuplicadoException("Ya existe un usuario con ese email");
        }
        Usuario usuario = Usuario.builder()
                .nombre(req.getNombre())
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPasswordTemporal()))
                .rol(req.getRol())
                .avatarColor(req.getAvatarColor() != null
                        ? req.getAvatarColor() : AVATAR_DEFAULT)
                .activo(true)
                .passwordTemporal(true)
                .build();
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void actualizarPermisos(Long usuarioId, ActualizarPermisosRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        for (PermisoInput input : req.getPermisos()) {
            Permiso permiso = permisoRepository
                    .findByUsuarioIdAndModulo(usuarioId, input.getModulo())
                    .orElseGet(() -> Permiso.builder()
                            .usuario(usuario)
                            .modulo(input.getModulo())
                            .build());
            permiso.setPuedeVer(input.getPuedeVer());
            permiso.setPuedeEditar(input.getPuedeEditar());
            permisoRepository.save(permiso);
        }
    }

    @Transactional
    public void cambiarEstado(Long usuarioId, CambiarEstadoUsuarioRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        usuario.setActivo(req.getActivo());
        usuarioRepository.save(usuario);
    }
}
