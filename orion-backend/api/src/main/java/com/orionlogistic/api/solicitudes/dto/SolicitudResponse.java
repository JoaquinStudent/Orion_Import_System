package com.orionlogistic.api.solicitudes.dto;

import com.orionlogistic.api.solicitudes.Solicitud;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Solicitud como la devuelve la API (alta pública y bandeja de revisión del admin). */
@Getter @AllArgsConstructor
public class SolicitudResponse {

    private Long id;
    private String titular;
    private String comunidad;
    private String consignatario;
    private String firma;
    private String numOrden;
    private String numTracking;
    private String whatsapp;
    private BigDecimal valorUsd;
    private List<ProductoItem> productos;
    private String estado;
    private LocalDateTime creadoEn;

    public static SolicitudResponse from(Solicitud s) {
        return new SolicitudResponse(
                s.getId(),
                s.getTitular(),
                s.getComunidad(),
                s.getConsignatario(),
                s.getFirma(),
                s.getNumOrden(),
                s.getNumTracking(),
                s.getWhatsapp(),
                s.getValorUsd(),
                s.getProductos(),
                s.getEstado(),
                s.getCreadoEn());
    }
}
