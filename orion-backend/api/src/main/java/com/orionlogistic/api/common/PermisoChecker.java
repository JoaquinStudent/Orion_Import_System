package com.orionlogistic.api.common;

import com.orionlogistic.api.usuarios.Permiso;
import com.orionlogistic.api.usuarios.PermisoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Verifica permisos por módulo de un EMPLEADO (tabla `permisos`).
 * ADMIN tiene acceso total implícito (doc 05b / 07): siempre pasa.
 * Lanza {@link ForbiddenException} (→ 403 SIN_PERMISO) cuando falta el permiso.
 */
@Component
@RequiredArgsConstructor
public class PermisoChecker {

    private final PermisoRepository permisoRepository;

    /** Exige que el usuario pueda VER el módulo. */
    public void exigirVer(Usuario usuario, String modulo) {
        if (esAdmin(usuario)) {
            return;
        }
        Permiso permiso = obtener(usuario, modulo);
        if (permiso == null || !Boolean.TRUE.equals(permiso.getPuedeVer())) {
            throw new ForbiddenException("No tienes permiso para ver " + modulo);
        }
    }

    /** Exige que el usuario pueda EDITAR el módulo. */
    public void exigirEditar(Usuario usuario, String modulo) {
        if (esAdmin(usuario)) {
            return;
        }
        Permiso permiso = obtener(usuario, modulo);
        if (permiso == null || !Boolean.TRUE.equals(permiso.getPuedeEditar())) {
            throw new ForbiddenException("No tienes permiso para editar " + modulo);
        }
    }

    private boolean esAdmin(Usuario usuario) {
        return "ADMIN".equals(usuario.getRol());
    }

    private Permiso obtener(Usuario usuario, String modulo) {
        return permisoRepository
                .findByUsuarioIdAndModulo(usuario.getId(), modulo)
                .orElse(null);
    }
}
