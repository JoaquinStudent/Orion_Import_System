package com.orionlogistic.api.pedidos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /** ¿Hay pedidos asignados a este estado? (chequeo ESTADO_EN_USO al borrar). */
    boolean existsByEstadoId(Long estadoId);

    boolean existsByNumOrden(String numOrden);

    boolean existsByNumTracking(String numTracking);

    /** Unicidad al editar: ¿existe otro pedido (id distinto) con ese valor? */
    boolean existsByNumOrdenAndIdNot(String numOrden, Long id);

    boolean existsByNumTrackingAndIdNot(String numTracking, Long id);

    /** Todos los pedidos de un estado (para armar el tablero). */
    List<Pedido> findByEstadoId(Long estadoId);

    /**
     * Listado con filtro por estado y búsqueda libre (num_orden / num_tracking /
     * titular). Cualquier filtro nulo se ignora. Orden lo aporta el {@link Pageable}.
     */
    @Query("""
            SELECT p FROM Pedido p
            WHERE (:estadoId IS NULL OR p.estado.id = :estadoId)
              AND (:search IS NULL
                   OR LOWER(p.numOrden)    LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.numTracking) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.titular)     LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Pedido> buscar(@Param("estadoId") Long estadoId,
                        @Param("search") String search,
                        Pageable pageable);
}
