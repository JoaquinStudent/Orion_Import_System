package com.orionlogistic.api.comunidades;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComunidadRepository extends JpaRepository<Comunidad, Long> {
    List<Comunidad> findAllByOrderByNombreAsc();
    List<Comunidad> findByActivoTrueOrderByNombreAsc();
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    boolean existsByNombreIgnoreCaseAndActivoTrue(String nombre);
    Optional<Comunidad> findByCodigoIgnoreCaseAndActivoTrue(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);
}
