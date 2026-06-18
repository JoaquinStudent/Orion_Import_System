package com.orionlogistic.api.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Payload para crear (POST) o editar (PUT) un pedido. Mismo shape en ambos casos:
 * el PUT reemplaza datos y la lista completa de productos (doc 05b).
 * Obligatorios (NOT NULL en BD): titular, num_orden, num_tracking, whatsapp,
 * costo_importacion_usd. `estado_id` opcional (si falta, se asigna el de menor orden).
 */
@Getter @Setter
public class PedidoRequest {

    @Size(max = 100)
    private String comunidad;

    @NotBlank @Size(max = 150)
    private String titular;

    @Size(max = 150)
    private String consignatario;

    @NotBlank @Size(max = 50)
    private String numOrden;

    @NotBlank @Size(max = 50)
    private String numTracking;

    @NotBlank @Size(max = 20)
    private String whatsapp;

    @Size(max = 150)
    private String firma;

    @PositiveOrZero
    private BigDecimal valorUsd;

    @NotNull @PositiveOrZero
    private BigDecimal costoImportacionUsd;

    /** Debe ser almacen | lima | shalom (CHECK en BD). Null permitido. */
    @Pattern(regexp = "almacen|lima|shalom",
            message = "debe ser almacen, lima o shalom")
    private String tipoEnvio;

    private Long estadoId;

    @Valid
    private List<ProductoInput> productos = new ArrayList<>();
}
