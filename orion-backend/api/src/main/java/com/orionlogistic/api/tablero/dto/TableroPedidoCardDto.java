package com.orionlogistic.api.tablero.dto;

import com.orionlogistic.api.pedidos.Pedido;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/** Pedido resumido dentro de una columna del tablero (doc 05b). */
@Getter @AllArgsConstructor
public class TableroPedidoCardDto {

    private Long id;
    private String numOrden;
    private String titular;
    private BigDecimal costoImportacionUsd;

    public static TableroPedidoCardDto from(Pedido p) {
        return new TableroPedidoCardDto(
                p.getId(), p.getNumOrden(), p.getTitular(), p.getCostoImportacionUsd());
    }
}
