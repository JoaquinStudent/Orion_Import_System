package com.orionlogistic.api.pedidos;

import jakarta.persistence.*;
import lombok.*;

/** Línea de producto de un pedido (tabla `productos`, FK ON DELETE CASCADE). */
@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false)
    @Builder.Default
    private Integer cantidad = 1;

    @Column(nullable = false, length = 200)
    private String producto;

    @Column(length = 100)
    private String marca;
}
