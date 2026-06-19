package com.orionlogistic.api.pedidos.dto;

import com.orionlogistic.api.pedidos.Pedido;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Pedido tal como aparece en el listado (GET /pedidos, doc 05b). */
@Getter @AllArgsConstructor
public class PedidoListItemResponse {

    private Long id;
    private String numOrden;
    private String numTracking;
    private String titular;
    private String whatsapp;
    private BigDecimal valorUsd;
    private BigDecimal costoImportacionUsd;
    private String tipoEnvio;
    private EstadoRefDto estado;
    private String estadoPago;
    private LocalDateTime creadoEn;

    public static PedidoListItemResponse from(Pedido p) {
        return new PedidoListItemResponse(
                p.getId(),
                p.getNumOrden(),
                p.getNumTracking(),
                p.getTitular(),
                p.getWhatsapp(),
                p.getValorUsd(),
                p.getCostoImportacionUsd(),
                p.getTipoEnvio(),
                EstadoRefDto.from(p.getEstado()),
                p.getEstadoPago(),
                p.getCreadoEn());
    }
}
