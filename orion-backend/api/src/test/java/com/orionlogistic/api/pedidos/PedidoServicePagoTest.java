package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.common.ValidationException;
import com.orionlogistic.api.configuracion.ConfiguracionService;
import com.orionlogistic.api.estados.EstadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/** Regla: no se puede liquidar el pago si el costo de importación es 0/null. */
@ExtendWith(MockitoExtension.class)
class PedidoServicePagoTest {

    @Mock PedidoRepository pedidoRepository;
    @Mock EstadoRepository estadoRepository;
    @Mock PermisoChecker permisoChecker;
    @Mock ConfiguracionService configuracionService;

    @InjectMocks PedidoService service;

    private Pedido pedidoConCosto(BigDecimal costo) {
        Pedido pedido = Pedido.builder().costoImportacionUsd(costo).estadoPago("pendiente").build();
        when(pedidoRepository.findById(any())).thenReturn(Optional.of(pedido));
        lenient().when(pedidoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        return pedido;
    }

    @Test
    void liquidarSinCosto_lanzaValidacion() {
        pedidoConCosto(null);
        assertThatThrownBy(() -> service.cambiarEstadoPago(1L, "liquidado", null))
                .isInstanceOf(ValidationException.class);

        pedidoConCosto(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.cambiarEstadoPago(1L, "liquidado", null))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void liquidarConCosto_ok() {
        Pedido pedido = pedidoConCosto(new BigDecimal("120.50"));
        service.cambiarEstadoPago(1L, "liquidado", null);
        assertThat(pedido.getEstadoPago()).isEqualTo("liquidado");
    }
}
