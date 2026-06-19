package com.orionlogistic.api.dashboard.dto;

import com.orionlogistic.api.pedidos.dto.PedidoListItemResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Resumen del dashboard (GET /dashboard/resumen).
 * Conteos calculados en el servidor (antes el front los derivaba de una página
 * de 200 pedidos, lo que se rompía al superar ese tope) + los últimos pedidos.
 * El card "Ingresos este mes" del dashboard sigue usando GET /finanzas/resumen.
 */
@Getter @AllArgsConstructor
public class DashboardResumenResponse {

    private long pedidosHoy;
    private long enTransito;
    private long enAduana;
    private long entregadosMes;
    private List<PedidoListItemResponse> ultimos;
}
