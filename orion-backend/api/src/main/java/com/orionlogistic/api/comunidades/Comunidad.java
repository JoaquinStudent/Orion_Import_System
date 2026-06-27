package com.orionlogistic.api.comunidades;

import jakarta.persistence.*;
import lombok.*;

/** Comunidad del catálogo (tabla `comunidades`) para el combobox de pedidos. */
@Entity
@Table(name = "comunidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comunidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    /** Código que el admin comparte con la comunidad; el cliente lo ingresa al registrar. */
    @Column(length = 50)
    private String codigo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
