package com.orionlogistic.api.estados;

import com.orionlogistic.api.common.EstadoEnUsoException;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.usuarios.PermisoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstadoServiceTest {

    @Mock EstadoRepository estadoRepository;
    @Mock PedidoRepository pedidoRepository;
    @Mock PermisoRepository permisoRepository;

    EstadoService estadoService;

    @BeforeEach
    void setUp() {
        estadoService = new EstadoService(
                estadoRepository, pedidoRepository, new PermisoChecker(permisoRepository));
    }

    @Test
    void eliminar_estadoConPedidos_lanzaEstadoEnUso() {
        Usuario admin = Usuario.builder().id(1L).rol("ADMIN").build();
        Estado estado = Estado.builder().id(3L).nombre("En aduana").orden(3).build();
        when(estadoRepository.findById(3L)).thenReturn(Optional.of(estado));
        when(pedidoRepository.existsByEstadoId(3L)).thenReturn(true);

        assertThatThrownBy(() -> estadoService.eliminar(3L, admin))
                .isInstanceOf(EstadoEnUsoException.class);

        verify(estadoRepository, never()).delete(any());
    }
}
