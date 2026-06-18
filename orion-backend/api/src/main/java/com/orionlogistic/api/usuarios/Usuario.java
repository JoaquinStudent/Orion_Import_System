package com.orionlogistic.api.usuarios;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String rol; // "ADMIN" o "EMPLEADO"

    @Column(name = "avatar_color", length = 7)
    private String avatarColor;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "password_temporal", nullable = false)
    @Builder.Default
    private Boolean passwordTemporal = true;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }
}