package com.orionlogistic.api.cotizador;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

/**
 * Tipo de cambio USD→PEN desde ExchangeRate-API, cacheado en memoria.
 * Refresca como mucho cada {@link #TTL}; si la API falla (o no hay key) usa un
 * valor de fallback configurable para que el cotizador nunca se rompa.
 */
@Service
public class ExchangeRateService {

    private static final Duration TTL = Duration.ofHours(6);

    private final RestClient restClient = RestClient.create();

    @Value("${exchangerate.api.key:}")
    private String apiKey;

    @Value("${exchangerate.fallback-usd-pen:3.40}")
    private BigDecimal fallback;

    private volatile BigDecimal rate;
    private volatile Instant fetchedAt;

    /** Tipo de cambio vigente (cacheado). */
    public synchronized UsdPen get() {
        if (rate == null || fetchedAt == null || Instant.now().isAfter(fetchedAt.plus(TTL))) {
            refresh();
        }
        return new UsdPen(rate, fetchedAt);
    }

    private void refresh() {
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("EXCHANGE_API_KEY no configurada");
            }
            ApiResp resp = restClient.get()
                    .uri("https://v6.exchangerate-api.com/v6/{key}/pair/USD/PEN", apiKey)
                    .retrieve()
                    .body(ApiResp.class);
            if (resp != null && "success".equals(resp.result()) && resp.conversionRate() != null) {
                rate = resp.conversionRate();
                fetchedAt = Instant.now();
                return;
            }
            throw new IllegalStateException("Respuesta inválida de ExchangeRate-API");
        } catch (Exception e) {
            // Si nunca tuvimos un valor, caemos al fallback; si teníamos uno viejo, lo mantenemos.
            if (rate == null) {
                rate = fallback;
                fetchedAt = Instant.now();
            }
        }
    }

    /** Valor + momento de actualización del tipo de cambio. */
    public record UsdPen(BigDecimal valor, Instant actualizado) {}

    /** Respuesta del endpoint /pair de ExchangeRate-API (campos relevantes). */
    private record ApiResp(
            String result,
            @JsonProperty("conversion_rate") BigDecimal conversionRate) {}
}
