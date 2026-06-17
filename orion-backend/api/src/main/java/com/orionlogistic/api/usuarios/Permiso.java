package com.orionlogistic.api.usuarios;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permisos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "modulo"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 30)
    private String modulo;

    @Column(name = "puede_ver", nullable = false)
    private Boolean puedeVer = false;

    @Column(name = "puede_editar", nullable = false)
    private Boolean puedeEditar = false;
}
