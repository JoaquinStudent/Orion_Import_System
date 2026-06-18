package com.orionlogistic.api.usuarios.dto;

import com.orionlogistic.api.usuarios.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Usuario expuesto en GET/POST /usuarios (sin hash de password, doc 05b). */
@Getter @AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String avatarColor;
    private boolean activo;

    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol(),
                u.getAvatarColor(),
                Boolean.TRUE.equals(u.getActivo()));
    }
}
