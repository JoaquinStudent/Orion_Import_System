package com.orionlogistic.api.configuracion;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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

    private final ConfiguracionRepository repository;

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
}
