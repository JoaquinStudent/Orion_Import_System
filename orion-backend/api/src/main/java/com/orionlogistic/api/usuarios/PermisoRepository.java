package com.orionlogistic.api.usuarios;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    // Obtener todos los permisos de un empleado
    List<Permiso> findByUsuarioId(Long usuarioId);

    // Obtener permiso específico de un empleado para un módulo
    // Útil para validar permisos en Sprint 2+
    java.util.Optional<Permiso> findByUsuarioIdAndModulo(Long usuarioId, String modulo);

    // Eliminar todos los permisos de un empleado (al reasignar)
    void deleteByUsuarioId(Long usuarioId);
}
