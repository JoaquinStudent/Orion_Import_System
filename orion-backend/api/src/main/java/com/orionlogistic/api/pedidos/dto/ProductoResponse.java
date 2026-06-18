package com.orionlogistic.api.pedidos.dto;

import com.orionlogistic.api.pedidos.Producto;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Línea de producto tal como la devuelve la API (con id). */
@Getter @AllArgsConstructor
public class ProductoResponse {

    private Long id;
    private Integer cantidad;
    private String producto;
    private String marca;

    public static ProductoResponse from(Producto p) {
        return new ProductoResponse(p.getId(), p.getCantidad(),
                p.getProducto(), p.getMarca());
    }
}
