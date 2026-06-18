package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Pedido de importación (tabla `pedidos`, doc 05b). */
@Entity
@Table(name = "pedidos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String comunidad;

    @Column(nullable = false, length = 150)
    private String titular;

    @Column(length = 150)
    private String consignatario;

    @Column(name = "num_orden", nullable = false, unique = true, length = 50)
    private String numOrden;

    @Column(name = "num_tracking", nullable = false, unique = true, length = 50)
    private String numTracking;

    @Column(nullable = false, length = 20)
    private String whatsapp;

    @Column(length = 150)
    private String firma;

    @Column(name = "valor_usd", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorUsd = BigDecimal.ZERO;

    @Column(name = "costo_importacion_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoImportacionUsd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id")
    private Estado estado;

    @Column(name = "tipo_envio", length = 30)
    private String tipoEnvio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Producto> productos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    /** Reemplaza toda la lista de productos manteniendo la relación bidireccional. */
    public void reemplazarProductos(List<Producto> nuevos) {
        productos.clear();
        for (Producto p : nuevos) {
            p.setPedido(this);
            productos.add(p);
        }
    }
}
