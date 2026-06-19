package com.orionlogistic.api.rastreo;

import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.estados.Estado;
import com.orionlogistic.api.estados.EstadoRepository;
import com.orionlogistic.api.pedidos.Pedido;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.rastreo.dto.RastreoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Rastreo público del pedido (doc 05.9). Sin autenticación. */
@Service
@RequiredArgsConstructor
public class RastreoService {

    private final PedidoRepository pedidoRepository;
    private final EstadoRepository estadoRepository;

    @Transactional(readOnly = true)
    public RastreoResponse rastrear(String numTracking, String numOrden) {
        return armar(buscar(numTracking, numOrden));
    }

    @Transactional
    public RastreoResponse elegirTipoEnvio(String numTracking, String numOrden, String tipoEnvio) {
        Pedido pedido = buscar(numTracking, numOrden);
        pedido.setTipoEnvio(tipoEnvio);
        return armar(pedidoRepository.save(pedido));
    }

    private Pedido buscar(String numTracking, String numOrden) {
        return pedidoRepository
                .findByNumTrackingAndNumOrden(numTracking.trim(), numOrden.trim())
                .orElseThrow(() -> new NotFoundException(
                        "No encontramos un pedido con esos datos. Verificá el tracking y la orden."));
    }

    private RastreoResponse armar(Pedido p) {
        List<Estado> todos = estadoRepository.findAllByOrderByOrdenAsc();
        int ordenActual = p.getEstado() != null ? p.getEstado().getOrden() : 0;
        int maxOrden = todos.stream().mapToInt(Estado::getOrden).max().orElse(0);

        List<RastreoResponse.Paso> pasos = todos.stream()
                .map(e -> new RastreoResponse.Paso(
                        e.getNombre(),
                        e.getOrden() < ordenActual,
                        e.getOrden() == ordenActual))
                .toList();

        List<RastreoResponse.ProductoRastreo> productos = p.getProductos().stream()
                .map(pr -> new RastreoResponse.ProductoRastreo(
                        pr.getCantidad(), pr.getProducto(), pr.getMarca()))
                .toList();

        return new RastreoResponse(
                p.getTitular(),
                p.getConsignatario(),
                p.getComunidad(),
                productos,
                p.getEstado() != null ? p.getEstado().getNombre() : null,
                pasos,
                p.getTipoEnvio(),
                ordenActual < maxOrden); // ya entregado → no puede elegir
    }
}
