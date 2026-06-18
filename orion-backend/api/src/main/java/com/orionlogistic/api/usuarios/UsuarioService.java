package com.orionlogistic.api.usuarios;

import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.usuarios.dto.ActualizarPermisosRequest;
import com.orionlogistic.api.usuarios.dto.CrearUsuarioRequest;
import com.orionlogistic.api.usuarios.dto.UsuarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

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
                .rol(req.getRol() != null ? req.getRol() : "EMPLEADO")
                .avatarColor(req.getAvatarColor())
                .activo(true)
                .passwordTemporal(true)
                .build();
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /** Reemplaza por completo los permisos del usuario (doc 05b). */
    @Transactional
    public void actualizarPermisos(Long id, ActualizarPermisosRequest req) {
        Usuario usuario = buscar(id);
        permisoRepository.deleteByUsuarioId(id);
        List<Permiso> nuevos = req.getPermisos().stream()
                .map(in -> Permiso.builder()
                        .usuario(usuario)
                        .modulo(in.getModulo())
                        .puedeVer(in.isPuedeVer())
                        .puedeEditar(in.isPuedeEditar())
                        .build())
                .toList();
        permisoRepository.saveAll(nuevos);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo) {
        Usuario usuario = buscar(id);
        usuario.setActivo(activo);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}
