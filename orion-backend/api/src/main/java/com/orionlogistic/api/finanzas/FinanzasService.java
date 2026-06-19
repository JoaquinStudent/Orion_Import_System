package com.orionlogistic.api.finanzas;

import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.finanzas.dto.FinanzasKpisResponse;
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
import java.util.stream.Collectors;

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

        // Solo los pedidos con pago LIQUIDADO cuentan como ingreso.
        for (Pedido p : pedidos.stream()
                .filter(p -> p.getCreadoEn() != null)
                .filter(p -> "liquidado".equals(p.getEstadoPago()))
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

        return new FinanzasResumenResponse(
                total, pedidos.size(), serie, desglosePorTipoEnvio(pedidos));
    }

    /** Cuenta los pedidos por tipo de envío (incluye sin asignar = tipo_envio null). */
    private List<FinanzasResumenResponse.DesgloseTipoEnvio> desglosePorTipoEnvio(List<Pedido> pedidos) {
        Map<String, Long> porTipo = pedidos.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getTipoEnvio() == null ? "" : p.getTipoEnvio(),
                        LinkedHashMap::new,
                        Collectors.counting()));
        return porTipo.entrySet().stream()
                .map(e -> new FinanzasResumenResponse.DesgloseTipoEnvio(
                        e.getKey().isEmpty() ? null : e.getKey(), e.getValue()))
                .toList();
    }

    /** KPIs financieros del panel (ingresos liquidados por ventana + mejor mes del año). */
    @Transactional(readOnly = true)
    public FinanzasKpisResponse kpis(Usuario usuario) {
        permisoChecker.exigirVer(usuario, MODULO);

        LocalDate hoy = LocalDate.now();
        LocalDate ayer = hoy.minusDays(1);
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate inicioAnio = hoy.withDayOfYear(1);

        List<Pedido> delAnio = pedidosEnRango(inicioAnio.toString(), hoy.toString());
        List<Pedido> delMes = pedidosEnRango(inicioMes.toString(), hoy.toString());

        BigDecimal ingresoHoy = ingresoLiquidadoEntre(delMes, hoy, hoy);
        BigDecimal ingresoAyer = ingresoLiquidadoEntre(delMes, ayer, ayer);
        BigDecimal ingresoMes = ingresoLiquidadoEntre(delMes, inicioMes, hoy);
        BigDecimal ingresoAnio = ingresoLiquidadoEntre(delAnio, inicioAnio, hoy);

        return new FinanzasKpisResponse(
                ingresoHoy, ingresoAyer, ingresoMes,
                delMes.size(), ingresoAnio, mejorMesDelAnio(delAnio));
    }

    /** Suma de costos de los pedidos LIQUIDADOS cuya fecha de creación cae en [desde, hasta]. */
    private BigDecimal ingresoLiquidadoEntre(List<Pedido> pedidos, LocalDate desde, LocalDate hasta) {
        return pedidos.stream()
                .filter(p -> p.getCreadoEn() != null)
                .filter(p -> "liquidado".equals(p.getEstadoPago()))
                .filter(p -> {
                    LocalDate f = p.getCreadoEn().toLocalDate();
                    return !f.isBefore(desde) && !f.isAfter(hasta);
                })
                .map(p -> p.getCostoImportacionUsd() != null
                        ? p.getCostoImportacionUsd() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Mes (1-12) con mayor ingreso liquidado dentro de la lista, o null si no hay ingresos. */
    private Integer mejorMesDelAnio(List<Pedido> delAnio) {
        Map<Integer, BigDecimal> porMes = new LinkedHashMap<>();
        for (Pedido p : delAnio) {
            if (p.getCreadoEn() == null || !"liquidado".equals(p.getEstadoPago())) {
                continue;
            }
            BigDecimal costo = p.getCostoImportacionUsd() != null
                    ? p.getCostoImportacionUsd() : BigDecimal.ZERO;
            porMes.merge(p.getCreadoEn().getMonthValue(), costo, BigDecimal::add);
        }
        return porMes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
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
