package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.PageResponse;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.estados.EstadoRepository;
import com.orionlogistic.api.pedidos.dto.*;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final String MODULO_PEDIDOS = "pedidos";
    private static final String MODULO_TABLERO = "tablero";

    private final PedidoRepository pedidoRepository;
    private final EstadoRepository estadoRepository;
    private final PermisoChecker permisoChecker;

    @Transactional(readOnly = true)
    public PageResponse<PedidoListItemResponse> listar(
            Long estadoId, String search, int page, int size, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO_PEDIDOS);
        String termino = (search == null || search.isBlank()) ? null : search.trim();
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "creadoEn"));
        Page<Pedido> pedidos = pedidoRepository.buscar(estadoId, termino, pageable);
        return PageResponse.of(pedidos, PedidoListItemResponse::from);
    }

    @Transactional(readOnly = true)
    public PedidoDetailResponse obtener(Long id, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO_PEDIDOS);
        return PedidoDetailResponse.from(buscarPedido(id));
    }

    @Transactional
    public PedidoDetailResponse crear(PedidoRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);

        if (pedidoRepository.existsByNumOrden(req.getNumOrden())) {
            throw new DuplicadoException("El número de orden ya existe");
        }
        if (pedidoRepository.existsByNumTracking(req.getNumTracking())) {
            throw new DuplicadoException("El número de tracking ya existe");
        }

        Pedido pedido = Pedido.builder()
                .creadoPor(usuario)
                .build();
        aplicarDatos(pedido, req);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDetailResponse actualizar(Long id, PedidoRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);
        Pedido pedido = buscarPedido(id);

        if (pedidoRepository.existsByNumOrdenAndIdNot(req.getNumOrden(), id)) {
            throw new DuplicadoException("El número de orden ya existe");
        }
        if (pedidoRepository.existsByNumTrackingAndIdNot(req.getNumTracking(), id)) {
            throw new DuplicadoException("El número de tracking ya existe");
        }

        aplicarDatos(pedido, req);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDetailResponse cambiarEstado(Long id, Long estadoId, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_TABLERO);
        Pedido pedido = buscarPedido(id);
        Estado estado = estadoRepository.findById(estadoId)
                .orElseThrow(() -> new NotFoundException("Estado no encontrado"));
        pedido.setEstado(estado);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public void eliminar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);
        Pedido pedido = buscarPedido(id);
        pedidoRepository.delete(pedido);
    }

    private Pedido buscarPedido(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));
    }

    /** Copia los datos del request al pedido y reemplaza la lista de productos. */
    private void aplicarDatos(Pedido pedido, PedidoRequest req) {
        pedido.setComunidad(req.getComunidad());
        pedido.setTitular(req.getTitular());
        pedido.setConsignatario(req.getConsignatario());
        pedido.setNumOrden(req.getNumOrden());
        pedido.setNumTracking(req.getNumTracking());
        pedido.setWhatsapp(req.getWhatsapp());
        pedido.setFirma(req.getFirma());
        pedido.setValorUsd(req.getValorUsd() != null ? req.getValorUsd() : BigDecimal.ZERO);
        pedido.setCostoImportacionUsd(req.getCostoImportacionUsd());
        pedido.setTipoEnvio(req.getTipoEnvio());
        pedido.setEstado(resolverEstado(req.getEstadoId()));

        List<Producto> productos = req.getProductos().stream()
                .map(in -> Producto.builder()
                        .cantidad(in.getCantidad())
                        .producto(in.getProducto())
                        .marca(in.getMarca())
                        .build())
                .toList();
        pedido.reemplazarProductos(productos);
    }

    /** Estado por id; si no se envía, el de menor `orden` (doc 05b). */
    private Estado resolverEstado(Long estadoId) {
        if (estadoId != null) {
            return estadoRepository.findById(estadoId)
                    .orElseThrow(() -> new NotFoundException("Estado no encontrado"));
        }
        return estadoRepository.findFirstByOrderByOrdenAsc()
                .orElseThrow(() -> new NotFoundException(
                        "No hay estados configurados para asignar al pedido"));
    }
}
