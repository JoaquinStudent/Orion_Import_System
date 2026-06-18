package com.orionlogistic.api.finanzas;

import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.finanzas.dto.FinanzasResumenResponse;
import com.orionlogistic.api.pedidos.Pedido;
import com.orionlogistic.api.pedidos.PedidoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/** Resumen financiero (ingresos por importaciones) — doc 05.7. */
@Service
@RequiredArgsConstructor
public class FinanzasService {

    private static final String MODULO = "finanzas";

    private final PedidoRepository pedidoRepository;
    private final PermisoChecker permisoChecker;
    private final ExcelExporter excelExporter;

    /** Pedidos del rango pedido (o todos si no se especifica). */
    public List<Pedido> pedidosEnRango(String desde, String hasta) {
        LocalDateTime ini = desde != null ? LocalDate.parse(desde).atStartOfDay() : null;
        LocalDateTime fin = hasta != null ? LocalDate.parse(hasta).atTime(23, 59, 59) : null;
        if (ini == null && fin == null) {
            return pedidoRepository.findAll();
        }
        return pedidoRepository.findByCreadoEnBetween(
                ini != null ? ini : LocalDateTime.of(1970, 1, 1, 0, 0),
                fin != null ? fin : LocalDateTime.now().plusYears(100));
    }

    @Transactional(readOnly = true)
    public FinanzasResumenResponse resumen(String periodo, String desde, String hasta, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);
        List<Pedido> pedidos = pedidosEnRango(desde, hasta);

        Function<LocalDateTime, String> clave = claveSegunPeriodo(periodo);
        Map<String, BigDecimal> porFecha = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Pedido p : pedidos.stream()
                .filter(p -> p.getCreadoEn() != null)
                .sorted((a, b) -> a.getCreadoEn().compareTo(b.getCreadoEn()))
                .toList()) {
            BigDecimal costo = p.getCostoImportacionUsd() != null
                    ? p.getCostoImportacionUsd() : BigDecimal.ZERO;
            total = total.add(costo);
            String k = clave.apply(p.getCreadoEn());
            porFecha.merge(k, costo, BigDecimal::add);
        }

        List<FinanzasResumenResponse.Punto> serie = porFecha.entrySet().stream()
                .map(e -> new FinanzasResumenResponse.Punto(e.getKey(), e.getValue()))
                .toList();

        return new FinanzasResumenResponse(total, pedidos.size(), serie);
    }

    /** Reporte .xlsx de los pedidos del rango (dentro de la tx para el lazy del estado). */
    @Transactional(readOnly = true)
    public byte[] exportar(String desde, String hasta, Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);
        return excelExporter.reportePedidos(pedidosEnRango(desde, hasta));
    }

    private Function<LocalDateTime, String> claveSegunPeriodo(String periodo) {
        return switch (periodo == null ? "mes" : periodo) {
            case "dia" -> dt -> dt.toLocalDate().toString();             // yyyy-MM-dd
            case "anio" -> dt -> String.valueOf(dt.getYear());           // yyyy
            default -> dt -> YearMonth.from(dt).toString();              // yyyy-MM (mes)
        };
    }
}
