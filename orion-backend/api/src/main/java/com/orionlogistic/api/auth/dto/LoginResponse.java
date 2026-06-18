package com.orionlogistic.api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

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
    }
}
