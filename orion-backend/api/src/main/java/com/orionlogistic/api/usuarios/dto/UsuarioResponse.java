package com.orionlogistic.api.usuarios.dto;

import com.orionlogistic.api.usuarios.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** Usuario en el listado de administración (GET /usuarios). Sin datos sensibles. */
@Getter @AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String avatarColor;
    private boolean activo;
    /** Permisos por módulo (para precargar el drawer). ADMIN → vacío (acceso total). */
    private List<PermisoDto> permisos;

    public static UsuarioResponse from(Usuario u, List<PermisoDto> permisos) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol(),
                u.getAvatarColor(),
                Boolean.TRUE.equals(u.getActivo()),
                permisos);
    }

    public static UsuarioResponse from(Usuario u) {
        return from(u, List.of());
    }
}
