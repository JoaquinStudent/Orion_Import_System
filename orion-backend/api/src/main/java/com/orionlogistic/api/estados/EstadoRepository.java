package com.orionlogistic.api.estados;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstadoRepository extends JpaRepository<Estado, Long> {

    /** Estados ordenados por su columna `orden` (listado y tablero). */
    List<Estado> findAllByOrderByOrdenAsc();

    /** Estado de menor `orden`; default cuando un pedido se crea sin estado_id. */
    Optional<Estado> findFirstByOrderByOrdenAsc();
}
