package com.orionlogistic.api.solicitudes;

import com.orionlogistic.api.solicitudes.dto.ProductoItem;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido registrado por un cliente desde la landing (tabla `solicitudes`), separado de
 * `pedidos`: queda en una bandeja de revisión hasta que el staff lo aprueba (y recién ahí
 * se crea el Pedido real). Así nada sin revisar llega al tablero ni a finanzas.
 */
@Entity
@Table(name = "solicitudes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titular;

    @Column(nullable = false, length = 100)
    private String comunidad;

    @Column(length = 150)
    private String consignatario;

    @Column(length = 150)
    private String firma;

    @Column(name = "num_orden", nullable = false, length = 50)
    private String numOrden;

    @Column(name = "num_tracking", nullable = false, length = 50)
    private String numTracking;

    @Column(nullable = false, length = 20)
    private String whatsapp;

    @Column(name = "valor_usd", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorUsd = BigDecimal.ZERO;

    /** Productos como JSON (transitorio: se normaliza a filas reales al aprobar). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<ProductoItem> productos = new ArrayList<>();

    /** 'pendiente' | 'aprobada' | 'rechazada'. */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "pendiente";

    @Column(length = 45)
    private String ip;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisado_por")
    private Usuario revisadoPor;

    @Column(name = "revisado_en")
    private LocalDateTime revisadoEn;

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }
}
