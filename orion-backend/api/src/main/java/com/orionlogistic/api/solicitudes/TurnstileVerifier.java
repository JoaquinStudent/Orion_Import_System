package com.orionlogistic.api.solicitudes;

import com.orionlogistic.api.common.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Verifica el token de Cloudflare Turnstile server-side. Si no hay secret configurado
 * (TURNSTILE_SECRET vacío, p. ej. en dev) la verificación se omite.
 * // ponytail: sin secret => no se valida; en prod se setea TURNSTILE_SECRET.
 */
@Slf4j
@Component
public class TurnstileVerifier {

    private static final String URL =
            "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final String secret;
    private final RestClient http = RestClient.create();

    public TurnstileVerifier(@Value("${turnstile.secret:}") String secret) {
        this.secret = secret;
    }

    public void verificar(String token) {
        if (!StringUtils.hasText(secret)) {
            return; // Turnstile deshabilitado
        }
        if (!StringUtils.hasText(token)) {
            throw new ValidationException("Verificación anti-spam faltante");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secret);
        form.add("response", token);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> res = http.post().uri(URL).body(form)
                    .retrieve().body(Map.class);
            if (res == null || !Boolean.TRUE.equals(res.get("success"))) {
                throw new ValidationException("No se pudo verificar que no sos un bot");
            }
        } catch (ValidationException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Fallo verificando Turnstile", e);
            throw new ValidationException("No se pudo verificar el anti-spam, intentá de nuevo");
        }
    }
}
