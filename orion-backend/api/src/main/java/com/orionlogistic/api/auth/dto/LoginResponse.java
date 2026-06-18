package com.orionlogistic.api.auth.dto;

import com.orionlogistic.api.usuarios.dto.PermisoDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter @AllArgsConstructor
public class LoginResponse {
    private String token;
    private UsuarioDto usuario;

    @Getter @AllArgsConstructor
    public static class UsuarioDto {
        private Long id;
        private String nombre;
        private String email;
        private String rol;
        private String avatarColor;
        private boolean passwordTemporal;
        /** Permisos por módulo (solo EMPLEADO). ADMIN → lista vacía (acceso total). */
        private List<PermisoDto> permisos;
    }
}
