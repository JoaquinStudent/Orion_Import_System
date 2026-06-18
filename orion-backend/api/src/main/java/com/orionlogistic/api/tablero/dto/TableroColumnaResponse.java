package com.orionlogistic.api.tablero.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** Columna del tablero kanban (GET /tablero): un estado con sus pedidos. */
@Getter @AllArgsConstructor
public class TableroColumnaResponse {

    private Long id;
    private String nombre;
    private String color;
    private List<TableroPedidoCardDto> pedidos;
}
