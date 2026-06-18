package com.orionlogistic.api.estados;

import com.orionlogistic.api.common.EstadoEnUsoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.estados.dto.EstadoRequest;
import com.orionlogistic.api.estados.dto.EstadoResponse;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstadoService {

    private static final String MODULO = "tablero";

    private final EstadoRepository estadoRepository;
    private final PedidoRepository pedidoRepository;
    private final PermisoChecker permisoChecker;

    @Transactional(readOnly = true)
    public List<EstadoResponse> listar() {
        return estadoRepository.findAllByOrderByOrdenAsc().stream()
                .map(EstadoResponse::from)
                .toList();
    }

    @Transactional
    public EstadoResponse crear(EstadoRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Estado estado = Estado.builder()
                .nombre(req.getNombre())
                .orden(req.getOrden())
                .color(req.getColor())
                .build();
        return EstadoResponse.from(estadoRepository.save(estado));
    }

    @Transactional
    public EstadoResponse actualizar(Long id, EstadoRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Estado estado = buscar(id);
        estado.setNombre(req.getNombre());
        estado.setOrden(req.getOrden());
        estado.setColor(req.getColor());
        return EstadoResponse.from(estadoRepository.save(estado));
    }

    @Transactional
    public void eliminar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Estado estado = buscar(id);
        if (pedidoRepository.existsByEstadoId(id)) {
            throw new EstadoEnUsoException("Reasigná los pedidos antes de eliminar el estado");
        }
        estadoRepository.delete(estado);
    }

    private Estado buscar(Long id) {
        return estadoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estado no encontrado"));
    }
}
