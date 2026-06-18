package com.orionlogistic.api.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Hace que los rechazos de Spring Security salgan con el sobre {@link ApiResponse}
 * en vez del 401/403 "pelado" por defecto, para que el front siempre reciba el
 * mismo contrato JSON ({success:false, error, code}).
 *
 * - Sin token / token inválido en ruta protegida → 401 NO_AUTH.
 * - Autenticado pero sin rol (p. ej. EMPLEADO en /usuarios/**) → 403 SIN_PERMISO.
 *
 * (Los 403 lanzados desde la capa de servicio por permisos de módulo los maneja
 *  {@link GlobalExceptionHandler} vía {@link ForbiddenException}.)
 */
@Component
@RequiredArgsConstructor
public class RestAuthHandlers {

    private final ObjectMapper objectMapper;

    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) ->
                escribir(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "No autenticado", "NO_AUTH");
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) ->
                escribir(response, HttpServletResponse.SC_FORBIDDEN,
                        "No tienes permiso para esta acción", "SIN_PERMISO");
    }

    private void escribir(HttpServletResponse response, int status,
                          String error, String code) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(), ApiResponse.error(error, code));
    }
}
