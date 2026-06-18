package com.orionlogistic.api.cotizador;

import com.orionlogistic.api.configuracion.ConfiguracionService;
import com.orionlogistic.api.cotizador.dto.ActualizarCotizadorConfigRequest;
import com.orionlogistic.api.cotizador.dto.CotizacionResponse;
import com.orionlogistic.api.cotizador.dto.CotizadorConfigResponse;
import com.orionlogistic.api.cotizador.dto.TipoCambioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Lógica del cotizador público + configuración (doc 05.5 / 05.6). */
@Service
@RequiredArgsConstructor
public class CotizadorService {

    private static final BigDecimal FLETE_DEFAULT = new BigDecimal("10");
    private static final BigDecimal DESADUANAJE_DEFAULT = new BigDecimal("9");
    private static final int UMBRAL_DEFAULT = 200;
    private static final String WHATSAPP_DEFAULT = "+51999999999";

    private final ConfiguracionService configuracion;
    private final ExchangeRateService exchangeRate;

    public CotizadorConfigResponse obtenerConfig() {
        return new CotizadorConfigResponse(
                configuracion.getBigDecimal(ConfiguracionService.FLETE_POR_KILO, FLETE_DEFAULT),
                configuracion.getBigDecimal(ConfiguracionService.DESADUANAJE, DESADUANAJE_DEFAULT),
                configuracion.getInt(ConfiguracionService.UMBRAL_ASESOR, UMBRAL_DEFAULT),
                configuracion.getString(ConfiguracionService.WHATSAPP_ATENCION, WHATSAPP_DEFAULT));
    }

    public TipoCambioResponse tipoCambio() {
        ExchangeRateService.UsdPen tc = exchangeRate.get();
        return new TipoCambioResponse(tc.valor(), tc.actualizado());
    }

    /**
     * Calcula el costo de envío (doc 05.5):
     * peso_cobrado = ceil(peso); flete = peso_cobrado * flete_por_kilo;
     * total = flete + desaduanaje; total_pen = total * tipo_cambio.
     * Si valor > umbral → derivar a un asesor.
     */
    public CotizacionResponse calcular(BigDecimal valorUsd, BigDecimal pesoKg) {
        CotizadorConfigResponse cfg = obtenerConfig();

        if (valorUsd.compareTo(BigDecimal.valueOf(cfg.getUmbralAsesor())) > 0) {
            return CotizacionResponse.asesor(
                    "Para envíos mayores a $" + cfg.getUmbralAsesor()
                            + ", contacta con un asesor",
                    cfg.getWhatsappAtencion());
        }

        int pesoCobrado = pesoKg.setScale(0, RoundingMode.CEILING).intValueExact();
        BigDecimal flete = cfg.getFletePorKilo()
                .multiply(BigDecimal.valueOf(pesoCobrado));
        BigDecimal totalUsd = flete.add(cfg.getDesaduanaje());
        BigDecimal tipoCambio = exchangeRate.get().valor();
        BigDecimal totalPen = totalUsd.multiply(tipoCambio).setScale(2, RoundingMode.HALF_UP);

        return CotizacionResponse.calculo(
                valorUsd,
                pesoKg,
                pesoCobrado,
                flete.setScale(2, RoundingMode.HALF_UP),
                cfg.getDesaduanaje(),
                totalUsd.setScale(2, RoundingMode.HALF_UP),
                tipoCambio,
                totalPen);
    }

    public CotizadorConfigResponse actualizarConfig(ActualizarCotizadorConfigRequest req) {
        configuracion.set(ConfiguracionService.FLETE_POR_KILO, req.getFletePorKilo().toPlainString());
        configuracion.set(ConfiguracionService.DESADUANAJE, req.getDesaduanaje().toPlainString());
        return obtenerConfig();
    }
}
