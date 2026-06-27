package com.orionlogistic.api.solicitudes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Registro de pedido hecho por el cliente desde la landing. Mismos campos que el alta
 * interna PERO sin costo de importación, estado ni tipo de envío (los carga el staff al
 * aprobar). Endpoint público: ver SolicitudController.
 */
@Getter @Setter
public class SolicitudPublicaRequest {

    @NotBlank @Size(max = 150)
    private String titular;

    /** Código de la comunidad (lo comparte el admin). Requerido salvo que marque sinComunidad. */
    @Size(max = 50)
    private String codigoComunidad;

    /** Cliente externo: no pertenece a ninguna comunidad. */
    private boolean sinComunidad;

    @Size(max = 150)
    private String consignatario;

    @NotBlank @Size(max = 150)
    private String firma;

    @NotBlank @Size(max = 50)
    private String numOrden;

    @NotBlank @Size(max = 50)
    private String numTracking;

    @NotBlank @Size(max = 20)
    private String whatsapp;

    @PositiveOrZero
    private BigDecimal valorUsd;

    /** Cada pedido es un único producto. */
    @Valid
    @Size(min = 1, max = 1, message = "Cada pedido admite un único producto")
    private List<ProductoItem> productos = new ArrayList<>();

    /** Token de Cloudflare Turnstile (se verifica server-side si hay secret configurado). */
    private String turnstileToken;
}
