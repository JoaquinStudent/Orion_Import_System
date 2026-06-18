package com.orionlogistic.api.configuracion;

import jakarta.persistence.*;
import lombok.*;

/** Par clave-valor de configuración global (tabla `configuracion`). */
@Entity
@Table(name = "configuracion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String clave;

    @Column(nullable = false, length = 255)
    private String valor;
}
