package com.orionlogistic.api.solicitudes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    Page<Solicitud> findByEstado(String estado, Pageable pageable);

    /** Tope diario del registro público: cuántas se crearon desde el inicio del día. */
    long countByCreadoEnAfter(LocalDateTime desde);

    /** Anti-duplicado contra solicitudes aún pendientes (las aprobadas ya están en pedidos). */
    boolean existsByNumOrdenAndEstado(String numOrden, String estado);
    boolean existsByNumTrackingAndEstado(String numTracking, String estado);

    long countByEstado(String estado);
}
