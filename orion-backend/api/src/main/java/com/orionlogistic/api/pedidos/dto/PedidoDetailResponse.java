package com.orionlogistic.api.pedidos.dto;

import com.orionlogistic.api.pedidos.Pedido;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Pedido completo (GET /pedidos/{id}, y respuesta de POST/PUT — doc 05b). */
@Getter @AllArgsConstructor
public class PedidoDetailResponse {

    private Long id;
    private String comunidad;
    private String titular;
    private String consignatario;
    private String numOrden;
    private String numTracking;
    private String whatsapp;
    private String firma;
    private BigDecimal valorUsd;
    private BigDecimal costoImportacionUsd;
    private String tipoEnvio;
    private EstadoRefDto estado;
    private List<ProductoResponse> productos;
    private CreadoPorDto creadoPor;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    @Getter @AllArgsConstructor
    public static class CreadoPorDto {
        private Long id;
        private String nombre;

        static CreadoPorDto from(Usuario u) {
            if (u == null) {
                return null;
            }
            return new CreadoPorDto(u.getId(), u.getNombre());
        }
    }

    public static PedidoDetailResponse from(Pedido p) {
        return new PedidoDetailResponse(
                p.getId(),
                p.getComunidad(),
                p.getTitular(),
                p.getConsignatario(),
                p.getNumOrden(),
                p.getNumTracking(),
                p.getWhatsapp(),
                p.getFirma(),
                p.getValorUsd(),
                p.getCostoImportacionUsd(),
                p.getTipoEnvio(),
                EstadoRefDto.from(p.getEstado()),
                p.getProductos().stream().map(ProductoResponse::from).toList(),
                CreadoPorDto.from(p.getCreadoPor()),
                p.getCreadoEn(),
                p.getActualizadoEn());
    }
}
