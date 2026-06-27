package com.orionlogistic.api.solicitudes;

import com.orionlogistic.api.comunidades.ComunidadRepository;
import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.PageResponse;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.common.RateLimitException;
import com.orionlogistic.api.common.ValidationException;
import com.orionlogistic.api.configuracion.ConfiguracionService;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.pedidos.PedidoService;
import com.orionlogistic.api.pedidos.dto.PedidoDetailResponse;
import com.orionlogistic.api.pedidos.dto.PedidoRequest;
import com.orionlogistic.api.pedidos.dto.ProductoInput;
import com.orionlogistic.api.solicitudes.dto.ProductoItem;
import com.orionlogistic.api.solicitudes.dto.SolicitudPublicaRequest;
import com.orionlogistic.api.solicitudes.dto.SolicitudResponse;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private static final String MODULO = "pedidos";
    private static final String LIMITE_DIA = "limite_solicitudes_dia";
    private static final int LIMITE_DIA_DEFAULT = 50;

    private final SolicitudRepository solicitudRepository;
    private final ComunidadRepository comunidadRepository;
    private final PedidoRepository pedidoRepository;
    private final ConfiguracionService configuracionService;
    private final PermisoChecker permisoChecker;
    private final TurnstileVerifier turnstileVerifier;
    private final PedidoService pedidoService;

    /** Alta pública (cliente desde la landing). Sin auth: protegida por Turnstile + tope diario. */
    @Transactional
    public SolicitudResponse crearPublica(SolicitudPublicaRequest req, String ip) {
        turnstileVerifier.verificar(req.getTurnstileToken());

        int limite = configuracionService.getInt(LIMITE_DIA, LIMITE_DIA_DEFAULT);
        if (solicitudRepository.countByCreadoEnAfter(LocalDate.now().atStartOfDay()) >= limite) {
            throw new RateLimitException(
                    "Se alcanzó el máximo de registros por hoy. Probá más tarde.");
        }

        String comunidad;
        if (req.isSinComunidad()) {
            comunidad = "Cliente externo";
        } else {
            String codigo = trimOrNull(req.getCodigoComunidad());
            if (codigo == null) {
                throw new ValidationException("Ingresá el código de tu comunidad");
            }
            comunidad = comunidadRepository.findByCodigoIgnoreCaseAndActivoTrue(codigo)
                    .orElseThrow(() -> new ValidationException("El código de comunidad no es válido"))
                    .getNombre();
        }

        String numOrden = req.getNumOrden().trim();
        String numTracking = req.getNumTracking().trim();
        if (pedidoRepository.existsByNumOrden(numOrden)
                || solicitudRepository.existsByNumOrdenAndEstado(numOrden, "pendiente")) {
            throw new DuplicadoException("Ese número de orden ya fue registrado");
        }
        if (pedidoRepository.existsByNumTracking(numTracking)
                || solicitudRepository.existsByNumTrackingAndEstado(numTracking, "pendiente")) {
            throw new DuplicadoException("Ese número de tracking ya fue registrado");
        }

        Solicitud s = Solicitud.builder()
                .titular(req.getTitular().trim())
                .comunidad(comunidad)
                .consignatario(trimOrNull(req.getConsignatario()))
                .firma(trimOrNull(req.getFirma()))
                .numOrden(numOrden)
                .numTracking(numTracking)
                .whatsapp(req.getWhatsapp().trim())
                .valorUsd(req.getValorUsd())
                .productos(req.getProductos())
                .ip(ip)
                .estado("pendiente")
                .build();
        return SolicitudResponse.from(solicitudRepository.save(s));
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudResponse> listar(String estado, int page, int size, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);
        String filtro = (estado == null || estado.isBlank()) ? "pendiente" : estado;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "creadoEn"));
        Page<Solicitud> pagina = solicitudRepository.findByEstado(filtro, pageable);
        return PageResponse.of(pagina, SolicitudResponse::from);
    }

    @Transactional(readOnly = true)
    public long contarPendientes(Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);
        return solicitudRepository.countByEstado("pendiente");
    }

    /** Aprueba la solicitud creando el Pedido real (reusa PedidoService.crear). */
    @Transactional
    public PedidoDetailResponse aprobar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Solicitud s = buscar(id);
        if (!"pendiente".equals(s.getEstado())) {
            throw new ValidationException("La solicitud ya fue revisada");
        }
        PedidoDetailResponse pedido = pedidoService.crear(toPedidoRequest(s), usuario);
        s.setEstado("aprobada");
        s.setRevisadoPor(usuario);
        s.setRevisadoEn(LocalDateTime.now());
        solicitudRepository.save(s);
        return pedido;
    }

    @Transactional
    public SolicitudResponse rechazar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Solicitud s = buscar(id);
        if (!"pendiente".equals(s.getEstado())) {
            throw new ValidationException("La solicitud ya fue revisada");
        }
        s.setEstado("rechazada");
        s.setRevisadoPor(usuario);
        s.setRevisadoEn(LocalDateTime.now());
        return SolicitudResponse.from(solicitudRepository.save(s));
    }

    private Solicitud buscar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada"));
    }

    /** Construye el request de alta de pedido a partir de la solicitud (sin costo/estado). */
    private PedidoRequest toPedidoRequest(Solicitud s) {
        PedidoRequest req = new PedidoRequest();
        req.setComunidad(s.getComunidad());
        req.setTitular(s.getTitular());
        req.setConsignatario(s.getConsignatario());
        req.setNumOrden(s.getNumOrden());
        req.setNumTracking(s.getNumTracking());
        req.setWhatsapp(s.getWhatsapp());
        req.setFirma(s.getFirma());
        req.setValorUsd(s.getValorUsd());
        req.setProductos(s.getProductos().stream().map(SolicitudService::toProductoInput).toList());
        return req;
    }

    private static ProductoInput toProductoInput(ProductoItem item) {
        ProductoInput in = new ProductoInput();
        in.setCantidad(item.getCantidad());
        in.setProducto(item.getProducto());
        in.setMarca(item.getMarca());
        return in;
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
