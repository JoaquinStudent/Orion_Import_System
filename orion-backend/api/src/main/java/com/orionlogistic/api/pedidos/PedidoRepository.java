package com.orionlogistic.api.pedidos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /** ¿Hay pedidos asignados a este estado? (chequeo ESTADO_EN_USO al borrar). */
    boolean existsByEstadoId(Long estadoId);

    /** Pedidos creados dentro de un rango (para el resumen de finanzas). */
    List<Pedido> findByCreadoEnBetween(LocalDateTime desde, LocalDateTime hasta);

    /* ---- Conteos para el resumen del dashboard (GET /dashboard/resumen) ---- */

    /** Pedidos creados en un rango (p. ej. "hoy"). */
    long countByCreadoEnBetween(LocalDateTime desde, LocalDateTime hasta);

    /** Pedidos en un estado dado (por nombre del estado). */
    long countByEstadoNombre(String nombre);

    /** Pedidos en un estado dado y creados dentro de un rango (p. ej. entregados del mes). */
    long countByEstadoNombreAndCreadoEnBetween(
            String nombre, LocalDateTime desde, LocalDateTime hasta);

    /** Los 6 pedidos más recientes (tarjeta "Últimos pedidos" del dashboard). */
    List<Pedido> findTop6ByOrderByCreadoEnDesc();

    /** Rastreo público: valida tracking + orden juntos. */
    Optional<Pedido> findByNumTrackingAndNumOrden(String numTracking, String numOrden);

    /**
     * Pedidos archivados: en el estado final y entregados hace más de N días
     * (entregado_en anterior al cutoff). Para GET /pedidos?archivados=true.
     */
    Page<Pedido> findByEstadoIdAndEntregadoEnBefore(
            Long estadoId, LocalDateTime cutoff, Pageable pageable);

    /**
     * Pedidos a mostrar en el tablero: todos los que tienen estado, EXCLUYENDO los
     * archivados (estado final + entregado antes del cutoff). Filtra en la BD para no
     * traer a memoria los entregados viejos (escalabilidad). `finalEstadoId` nulo (no hay
     * estados) desactiva la exclusión.
     */
    @Query("""
            SELECT p FROM Pedido p
            WHERE p.estado IS NOT NULL
              AND NOT (:finalEstadoId IS NOT NULL AND p.estado.id = :finalEstadoId
                       AND p.entregadoEn IS NOT NULL AND p.entregadoEn < :cutoff)
            """)
    List<Pedido> findParaTablero(@Param("finalEstadoId") Long finalEstadoId,
                                 @Param("cutoff") LocalDateTime cutoff);

    /** Suma de costos de los pedidos LIQUIDADOS creados dentro del rango (ingreso). */
    @Query("""
            SELECT COALESCE(SUM(p.costoImportacionUsd), 0) FROM Pedido p
            WHERE p.estadoPago = 'liquidado' AND p.creadoEn BETWEEN :ini AND :fin
            """)
    BigDecimal sumIngresoLiquidado(@Param("ini") LocalDateTime ini,
                                   @Param("fin") LocalDateTime fin);

    /** Meses (1-12) del rango ordenados DESC por ingreso liquidado; el primero es el mejor. */
    @Query("""
            SELECT MONTH(p.creadoEn) FROM Pedido p
            WHERE p.estadoPago = 'liquidado' AND p.creadoEn BETWEEN :ini AND :fin
            GROUP BY MONTH(p.creadoEn)
            ORDER BY SUM(p.costoImportacionUsd) DESC
            """)
    List<Integer> mejorMes(@Param("ini") LocalDateTime ini, @Param("fin") LocalDateTime fin);

    boolean existsByNumOrden(String numOrden);

    boolean existsByNumTracking(String numTracking);

    /** Unicidad al editar: ¿existe otro pedido (id distinto) con ese valor? */
    boolean existsByNumOrdenAndIdNot(String numOrden, Long id);

    boolean existsByNumTrackingAndIdNot(String numTracking, Long id);

    /**
     * Listado con filtro por estado y búsqueda libre (num_orden / num_tracking /
     * titular). `estadoId` nulo se ignora; `search` vacío ("") trae todo.
     * Nota: `search` debe llegar NO nulo — un null lo bindea Postgres como bytea
     * y `lower()` falla (42883); el service lo normaliza a "".
     */
    @Query("""
            SELECT p FROM Pedido p
            WHERE (:estadoId IS NULL OR p.estado.id = :estadoId)
              AND (:search = ''
                   OR LOWER(p.numOrden)    LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.numTracking) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.titular)     LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Pedido> buscar(@Param("estadoId") Long estadoId,
                        @Param("search") String search,
                        Pageable pageable);
}
