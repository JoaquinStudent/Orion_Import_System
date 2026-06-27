package com.orionlogistic.api.configuracion;

import com.orionlogistic.api.configuracion.dto.ConfigPublicaResponse;
import com.orionlogistic.api.configuracion.dto.EstadoPublicoResponse;
import com.orionlogistic.api.estados.EstadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Lectura/escritura tipada de la tabla `configuracion` (key-value).
 * Las claves son las sembradas por setup_supabase.sql.
 */
@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    // Claves conocidas
    public static final String FLETE_POR_KILO = "flete_por_kilo";
    public static final String DESADUANAJE = "desaduanaje";
    public static final String UMBRAL_ASESOR = "umbral_asesor";
    public static final String WHATSAPP_ATENCION = "whatsapp_atencion";
    public static final String NOMBRE_NEGOCIO = "nombre_negocio";
    public static final String DIAS_ARCHIVO_ENTREGADOS = "dias_archivo_entregados";

    private final ConfiguracionRepository repository;
    private final EstadoRepository estadoRepository;

    public String getString(String clave, String porDefecto) {
        return repository.findByClave(clave)
                .map(Configuracion::getValor)
                .orElse(porDefecto);
    }

    public BigDecimal getBigDecimal(String clave, BigDecimal porDefecto) {
        try {
            return repository.findByClave(clave)
                    .map(c -> new BigDecimal(c.getValor()))
                    .orElse(porDefecto);
        } catch (NumberFormatException e) {
            return porDefecto;
        }
    }

    public int getInt(String clave, int porDefecto) {
        try {
            return repository.findByClave(clave)
                    .map(c -> Integer.parseInt(c.getValor().trim()))
                    .orElse(porDefecto);
        } catch (NumberFormatException e) {
            return porDefecto;
        }
    }

    /** Crea o actualiza el valor de una clave. */
    @Transactional
    public void set(String clave, String valor) {
        Configuracion cfg = repository.findByClave(clave)
                .orElseGet(() -> Configuracion.builder().clave(clave).build());
        cfg.setValor(valor);
        repository.save(cfg);
    }

    /**
     * Arma el response público del negocio (config + estados dinámicos). Único lugar que lo
     * construye para que GET /config/publica y PUT /admin/config devuelvan siempre la misma
     * forma (doc 05d.7). `estados` trae solo nombre/color/orden, ordenado por `orden`.
     */
    @Transactional(readOnly = true)
    public ConfigPublicaResponse construirPublica() {
        List<EstadoPublicoResponse> estados = estadoRepository.findAllByOrderByOrdenAsc().stream()
                .map(EstadoPublicoResponse::from)
                .toList();
        return new ConfigPublicaResponse(
                getString(WHATSAPP_ATENCION, "+51999999999"),
                getString(NOMBRE_NEGOCIO, "Orión Logistic"),
                getInt(DIAS_ARCHIVO_ENTREGADOS, 7),
                estados);
    }
}
