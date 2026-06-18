package com.orionlogistic.api.estados;

import jakarta.persistence.*;
import lombok.*;

/** Estado del tablero kanban (tabla `estados`, doc 05b). */
@Entity
@Table(name = "estados")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Estado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false)
    private Integer orden;

    @Column(length = 7)
    private String color;
}
