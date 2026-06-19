package com.orionlogistic.api.dashboard;

import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.dashboard.dto.DashboardResumenResponse;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.pedidos.dto.PedidoListItemResponse;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * KPIs del dashboard. Los conteos por nombre de estado replican la lógica que
 * antes vivía en el front; dependen de los nombres de estado semilla
 * ("En tránsito" / "En aduana" / "Entregado").
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final String MODULO = "pedidos";

    private final PedidoRepository pedidoRepository;
    private final PermisoChecker permisoChecker;

    @Transactional(readOnly = true)
    public DashboardResumenResponse resumen(Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);

        LocalDate hoy = LocalDate.now();
        LocalDateTime iniDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.atTime(23, 59, 59);
        LocalDateTime iniMes = hoy.withDayOfMonth(1).atStartOfDay();

        long pedidosHoy = pedidoRepository.countByCreadoEnBetween(iniDia, finDia);
        long enTransito = pedidoRepository.countByEstadoNombre("En tránsito");
        long enAduana = pedidoRepository.countByEstadoNombre("En aduana");
        long entregadosMes = pedidoRepository.countByEstadoNombreAndCreadoEnBetween(
                "Entregado", iniMes, finDia);

        return new DashboardResumenResponse(
                pedidosHoy,
                enTransito,
                enAduana,
                entregadosMes,
                pedidoRepository.findTop6ByOrderByCreadoEnDesc().stream()
                        .map(PedidoListItemResponse::from)
                        .toList());
    }
}
