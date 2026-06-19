package com.orionlogistic.api.tablero.dto;

import com.orionlogistic.api.pedidos.Pedido;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/** Tarjeta resumida de un pedido dentro de una columna del tablero. */
@Getter @AllArgsConstructor
public class TableroPedidoCardDto {

    private Long id;
    private String numOrden;
    private String numTracking;
    private String titular;
    private BigDecimal costoImportacionUsd;
    private String estadoPago;

    public static TableroPedidoCardDto from(Pedido p) {
        return new TableroPedidoCardDto(
                p.getId(), p.getNumOrden(), p.getNumTracking(), p.getTitular(),
                p.getCostoImportacionUsd(), p.getEstadoPago());
    }
}
