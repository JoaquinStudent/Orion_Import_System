package com.orionlogistic.api.tablero.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** Columna del kanban: un estado con sus pedidos (GET /tablero, doc 05b). */
@Getter @AllArgsConstructor
public class TableroColumnaResponse {

    private Long id;
    private String nombre;
    private String color;
    private List<TableroPedidoCardDto> pedidos;
}
