package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.PageResponse;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.common.ValidationException;
import com.orionlogistic.api.configuracion.ConfiguracionService;
import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.estados.EstadoRepository;
import com.orionlogistic.api.pedidos.dto.PedidoDetailResponse;
import com.orionlogistic.api.pedidos.dto.PedidoListItemResponse;
import com.orionlogistic.api.pedidos.dto.PedidoRequest;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final String MODULO_PEDIDOS = "pedidos";
    private static final String MODULO_TABLERO = "tablero";

    private final PedidoRepository pedidoRepository;
    private final EstadoRepository estadoRepository;
    private final PermisoChecker permisoChecker;
    private final ConfiguracionService configuracionService;

    @Transactional(readOnly = true)
    public PageResponse<PedidoListItemResponse> listar(
            Long estadoId, String search, boolean archivados, int page, int size, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO_PEDIDOS);
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "creadoEn"));
        if (archivados) {
            return listarArchivados(pageable);
        }
        // "" = sin filtro de búsqueda. Nunca null: un null lo bindea Postgres
        // como bytea y lower() falla (ver PedidoRepository.buscar).
        String termino = (search == null) ? "" : search.trim();
        Page<Pedido> pedidos = pedidoRepository.buscar(estadoId, termino, pageable);
        return PageResponse.of(pedidos, PedidoListItemResponse::from);
    }

    /** Solo los archivados: en el estado final y entregados hace más de N días. */
    private PageResponse<PedidoListItemResponse> listarArchivados(PageRequest pageable) {
        Estado estadoFinal = estadoRepository.findFirstByOrderByOrdenDesc().orElse(null);
        if (estadoFinal == null) {
            return PageResponse.of(Page.<Pedido>empty(pageable), PedidoListItemResponse::from);
        }
        LocalDateTime cutoff = LocalDateTime.now().minusDays(diasArchivoEntregados());
        Page<Pedido> pedidos = pedidoRepository.findByEstadoIdAndEntregadoEnBefore(
                estadoFinal.getId(), cutoff, pageable);
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
        Estado destino = buscarEstado(estadoId);

        validarReglasDeEstado(pedido, destino);

        pedido.setEstado(destino);
        aplicarEntregadoEn(pedido, destino);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDetailResponse cambiarEstadoPago(Long id, String estadoPago, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);
        Pedido pedido = buscarPedido(id);
        pedido.setEstadoPago(estadoPago);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDetailResponse actualizarCosto(Long id, BigDecimal costo, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);
        Pedido pedido = buscarPedido(id);
        pedido.setCostoImportacionUsd(costo);
        return PedidoDetailResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public void eliminar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO_PEDIDOS);
        pedidoRepository.delete(buscarPedido(id));
    }

    private Pedido buscarPedido(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));
    }

    private Estado buscarEstado(Long id) {
        return estadoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estado no encontrado"));
    }

    /**
     * Reglas de negocio autoritativas al mover de estado (doc 05d.3). El estado final y el
     * penúltimo se determinan por `orden` (NO por nombre: el admin puede renombrarlos).
     */
    private void validarReglasDeEstado(Pedido pedido, Estado destino) {
        List<Estado> ordenados = estadoRepository.findAllByOrderByOrdenAsc();
        if (ordenados.isEmpty()) {
            return;
        }
        Estado estadoFinal = ordenados.get(ordenados.size() - 1);
        Estado penultimo = ordenados.size() >= 2 ? ordenados.get(ordenados.size() - 2) : null;

        if (penultimo != null && destino.getId().equals(penultimo.getId())) {
            BigDecimal costo = pedido.getCostoImportacionUsd();
            if (costo == null || costo.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Cargá el costo de importación antes de avanzar");
            }
        }
        if (destino.getId().equals(estadoFinal.getId())
                && !"liquidado".equals(pedido.getEstadoPago())) {
            throw new ValidationException(
                    "Liquidá el pago antes de marcar el pedido como entregado");
        }
    }

    /**
     * Marca/limpia `entregado_en` según el nuevo estado: lo sella al entrar al estado final
     * (si no estaba sellado) y lo limpia si el pedido sale del estado final (evita que un
     * timestamp viejo lo archive). Base del archivado (doc 05d.4).
     */
    private void aplicarEntregadoEn(Pedido pedido, Estado nuevoEstado) {
        boolean esFinal = esEstadoFinal(nuevoEstado);
        if (esFinal && pedido.getEntregadoEn() == null) {
            pedido.setEntregadoEn(LocalDateTime.now());
        } else if (!esFinal) {
            pedido.setEntregadoEn(null);
        }
    }

    private boolean esEstadoFinal(Estado estado) {
        if (estado == null) {
            return false;
        }
        return estadoRepository.findFirstByOrderByOrdenDesc()
                .map(f -> f.getId().equals(estado.getId()))
                .orElse(false);
    }

    private int diasArchivoEntregados() {
        return configuracionService.getInt(
                ConfiguracionService.DIAS_ARCHIVO_ENTREGADOS, 7);
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
        Estado estado = resolverEstado(req.getEstadoId());
        pedido.setEstado(estado);
        aplicarEntregadoEn(pedido, estado);

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
            return buscarEstado(estadoId);
        }
        return estadoRepository.findFirstByOrderByOrdenAsc()
                .orElseThrow(() -> new NotFoundException(
                        "No hay estados configurados para asignar al pedido"));
    }
}
