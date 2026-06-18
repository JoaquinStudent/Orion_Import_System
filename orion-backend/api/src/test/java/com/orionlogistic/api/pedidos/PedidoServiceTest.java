package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.ForbiddenException;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.estados.EstadoRepository;
import com.orionlogistic.api.pedidos.dto.PedidoDetailResponse;
import com.orionlogistic.api.pedidos.dto.PedidoRequest;
import com.orionlogistic.api.usuarios.Permiso;
import com.orionlogistic.api.usuarios.PermisoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock PedidoRepository pedidoRepository;
    @Mock EstadoRepository estadoRepository;
    @Mock PermisoRepository permisoRepository;

    PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        // PermisoChecker real sobre un PermisoRepository mockeado, para ejercitar
        // la lógica de permisos de verdad (no mockear el checker).
        pedidoService = new PedidoService(
                pedidoRepository, estadoRepository, new PermisoChecker(permisoRepository));
    }

    private Usuario admin() {
        return Usuario.builder().id(1L).rol("ADMIN").build();
    }

    private Usuario empleado() {
        return Usuario.builder().id(2L).rol("EMPLEADO").build();
    }

    private PedidoRequest requestValido() {
        PedidoRequest req = new PedidoRequest();
        req.setTitular("Carlos Pérez");
        req.setNumOrden("ORD-1");
        req.setNumTracking("TRK-1");
        req.setWhatsapp("+51999999999");
        req.setCostoImportacionUsd(new BigDecimal("29.00"));
        return req;
    }

    @Test
    void crear_conNumOrdenDuplicado_lanzaDuplicado() {
        when(pedidoRepository.existsByNumOrden("ORD-1")).thenReturn(true);

        assertThatThrownBy(() -> pedidoService.crear(requestValido(), admin()))
                .isInstanceOf(DuplicadoException.class);

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void crear_sinEstadoId_asignaEstadoDeMenorOrden() {
        Estado primero = Estado.builder().id(10L).nombre("Recibido").orden(1).build();
        when(pedidoRepository.existsByNumOrden(any())).thenReturn(false);
        when(pedidoRepository.existsByNumTracking(any())).thenReturn(false);
        when(estadoRepository.findFirstByOrderByOrdenAsc()).thenReturn(Optional.of(primero));
        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PedidoDetailResponse res = pedidoService.crear(requestValido(), admin());

        assertThat(res.getEstado()).isNotNull();
        assertThat(res.getEstado().getId()).isEqualTo(10L);
        verify(estadoRepository).findFirstByOrderByOrdenAsc();
        verify(estadoRepository, never()).findById(any());
    }

    @Test
    void crear_empleadoSinPermisoEditar_lanzaForbidden() {
        // Sin fila de permiso para 'pedidos' → SIN_PERMISO.
        when(permisoRepository.findByUsuarioIdAndModulo(2L, "pedidos"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> pedidoService.crear(requestValido(), empleado()))
                .isInstanceOf(ForbiddenException.class);

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void crear_empleadoConPermisoEditar_creaPedido() {
        Permiso permiso = Permiso.builder()
                .modulo("pedidos").puedeVer(true).puedeEditar(true).build();
        Estado primero = Estado.builder().id(10L).orden(1).build();
        when(permisoRepository.findByUsuarioIdAndModulo(2L, "pedidos"))
                .thenReturn(Optional.of(permiso));
        when(pedidoRepository.existsByNumOrden(any())).thenReturn(false);
        when(pedidoRepository.existsByNumTracking(any())).thenReturn(false);
        when(estadoRepository.findFirstByOrderByOrdenAsc()).thenReturn(Optional.of(primero));
        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PedidoDetailResponse res = pedidoService.crear(requestValido(), empleado());

        assertThat(res.getTitular()).isEqualTo("Carlos Pérez");
        verify(pedidoRepository).save(any(Pedido.class));
    }
}
