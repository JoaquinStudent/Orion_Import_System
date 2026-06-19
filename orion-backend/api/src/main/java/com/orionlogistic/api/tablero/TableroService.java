package com.orionlogistic.api.tablero;

import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.configuracion.ConfiguracionService;
import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.estados.EstadoRepository;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.tablero.dto.TableroColumnaResponse;
import com.orionlogistic.api.tablero.dto.TableroPedidoCardDto;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableroService {

    private static final String MODULO = "tablero";

    private final EstadoRepository estadoRepository;
    private final PedidoRepository pedidoRepository;
    private final PermisoChecker permisoChecker;
    private final ConfiguracionService configuracionService;

    /** Kanban completo: estados ordenados, cada uno con sus pedidos resumidos. */
    @Transactional(readOnly = true)
    public List<TableroColumnaResponse> obtener(Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);

        // Excluir entregados archivados (estado final + entregado hace más de N días) para
        // que la columna "Entregado" no crezca sin límite (doc 05d.4). El filtro se hace en
        // la BD (findParaTablero) para no traer a memoria los entregados viejos.
        Estado estadoFinal = estadoRepository.findFirstByOrderByOrdenDesc().orElse(null);
        Long finalEstadoId = estadoFinal != null ? estadoFinal.getId() : null;
        LocalDateTime cutoff = LocalDateTime.now().minusDays(
                configuracionService.getInt(ConfiguracionService.DIAS_ARCHIVO_ENTREGADOS, 7));

        Map<Long, List<TableroPedidoCardDto>> porEstado =
                pedidoRepository.findParaTablero(finalEstadoId, cutoff).stream()
                        .collect(Collectors.groupingBy(
                                p -> p.getEstado().getId(),
                                Collectors.mapping(TableroPedidoCardDto::from, Collectors.toList())));

        return estadoRepository.findAllByOrderByOrdenAsc().stream()
                .map(e -> columna(e, porEstado))
                .toList();
    }

    private TableroColumnaResponse columna(
            Estado e, Map<Long, List<TableroPedidoCardDto>> porEstado) {
        return new TableroColumnaResponse(
                e.getId(),
                e.getNombre(),
                e.getColor(),
                porEstado.getOrDefault(e.getId(), List.of()));
    }
}
