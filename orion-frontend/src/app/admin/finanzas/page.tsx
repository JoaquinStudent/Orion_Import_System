"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  Lock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { obtenerResumen, obtenerKpis, exportarExcel } from "@/lib/services/finanzas";
import { listarPedidos, cambiarEstadoPago } from "@/lib/services/pedidos";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { TIPO_ENVIO_LABEL } from "@/lib/constants";
import { puedeVer } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { FinanzasKpis, FinanzasResumen } from "@/types/finanzas";
import type { PedidoListItem } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";
import { PagoBadge } from "@/components/pedidos/PagoBadge";

/* ---------- helpers de fecha y rango ---------- */
type Periodo = "hoy" | "semana" | "mes" | "anio";

const PERIODOS: { key: Periodo; label: string; api: "dia" | "mes" }[] = [
  { key: "hoy", label: "Hoy", api: "dia" },
  { key: "semana", label: "Esta semana", api: "dia" },
  { key: "mes", label: "Este mes", api: "dia" },
  { key: "anio", label: "Este año", api: "mes" },
];

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function rango(p: Periodo): { desde: string; hasta: string } {
  const hoy = new Date();
  const hasta = ymd(hoy);
  if (p === "hoy") return { desde: hasta, hasta };
  if (p === "semana") {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6);
    return { desde: ymd(d), hasta };
  }
  if (p === "mes") {
    return { desde: ymd(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta };
  }
  return { desde: ymd(new Date(hoy.getFullYear(), 0, 1)), hasta };
}

/* ---------- página ---------- */
export default function FinanzasPage() {
  const { usuario, loading: authLoading } = useAuth();
  const permitido = puedeVer(usuario, "finanzas");

  const [kpis, setKpis] = useState<FinanzasKpis | null>(null);
  const [resumen, setResumen] = useState<FinanzasResumen | null>(null);
  const [detalle, setDetalle] = useState<PedidoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [exportando, setExportando] = useState(false);
  const [liquidandoId, setLiquidandoId] = useState<number | null>(null);

  // KPIs (server-side) + últimas 8 filas del detalle. Carga única.
  useEffect(() => {
    if (authLoading || !permitido) return;
    Promise.all([obtenerKpis(), listarPedidos({ size: 8 })])
      .then(([k, d]) => {
        setKpis(k);
        setDetalle(d.content);
      })
      .catch((e) => toast.error(getApiErrorMessage(e, "No se pudieron cargar los datos")))
      .finally(() => setLoading(false));
  }, [authLoading, permitido]);

  // Resumen del período activo: serie del gráfico + total + ingreso + desglose por tipo.
  const fetchResumen = useCallback(async () => {
    const { desde, hasta } = rango(periodo);
    const api = PERIODOS.find((x) => x.key === periodo)!.api;
    try {
      setResumen(await obtenerResumen({ periodo: api, desde, hasta }));
    } catch {
      setResumen(null);
    }
  }, [periodo]);

  useEffect(() => {
    if (!authLoading && permitido) fetchResumen();
  }, [authLoading, permitido, fetchResumen]);

  const serie = resumen?.serie ?? [];
  const deltaAyer =
    kpis && kpis.ingreso_ayer_usd > 0
      ? ((kpis.ingreso_hoy_usd - kpis.ingreso_ayer_usd) / kpis.ingreso_ayer_usd) * 100
      : null;
  const mejorMes = kpis?.mejor_mes ? MESES[kpis.mejor_mes - 1] : null;
  const desglose = resumen?.desglose_tipo_envio ?? [];

  async function onExportar() {
    setExportando(true);
    try {
      await exportarExcel(rango(periodo));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudo exportar"));
    } finally {
      setExportando(false);
    }
  }

  // Liquidar el pago de un pedido desde la tabla (recién ahí cuenta como ingreso).
  async function liquidar(p: PedidoListItem) {
    setLiquidandoId(p.id);
    try {
      await cambiarEstadoPago(p.id, "liquidado");
      setDetalle((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, estado_pago: "liquidado" } : x))
      );
      // KPIs y resumen los recalcula el backend.
      await Promise.all([obtenerKpis().then(setKpis), fetchResumen()]);
      toast.success(`Pago de ${p.num_orden} liquidado`);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudo liquidar"));
    } finally {
      setLiquidandoId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!permitido) {
    return (
      <div className="mx-auto max-w-md py-24 text-center text-on-surface-muted">
        <Lock className="mx-auto mb-3 h-10 w-10 opacity-60" />
        <p>No tenés permiso para ver Finanzas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado + toggle + exportar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Finanzas</h1>
          <p className="text-sm text-on-surface-variant">
            Gestión de ingresos por servicios de importación.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-outline-variant bg-white p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  periodo === p.key
                    ? "bg-primary text-primary-foreground"
                    : "text-on-surface-variant hover:bg-secondary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button onClick={onExportar} disabled={exportando} variant="secondary">
            {exportando ? <Loader2 className="animate-spin" /> : <Download />}
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          titulo="Ingresos hoy"
          valor={formatUSD(kpis?.ingreso_hoy_usd ?? 0)}
          extra={
            deltaAyer === null ? (
              <span className="text-on-surface-muted">Sin datos de ayer</span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 ${
                  deltaAyer >= 0 ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {deltaAyer >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {deltaAyer >= 0 ? "+" : ""}
                {deltaAyer.toFixed(0)}% vs ayer
              </span>
            )
          }
        />
        <KpiCard
          titulo="Ingresos este mes"
          valor={formatUSD(kpis?.ingreso_mes_usd ?? 0)}
          extra={`${kpis?.pedidos_mes ?? 0} pedidos registrados`}
        />
        <KpiCard
          titulo="Ingresos este año"
          valor={formatUSD(kpis?.ingreso_anio_usd ?? 0)}
          extra={mejorMes ? `Mejor mes: ${capitalizar(mejorMes)}` : "—"}
        />
      </div>

      {/* Contenido: gráfico + tabla | resumen */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolución de ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : serie.length === 0 ? (
                <p className="py-20 text-center text-sm text-on-surface-muted">
                  No hay ingresos en este período.
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serie} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF8" vertical={false} />
                      <XAxis
                        dataKey="fecha"
                        tickFormatter={(f) => formatFecha(String(f))}
                        tick={{ fontSize: 12, fill: "#5B6472" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E8EDF8" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#5B6472" }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                      />
                      <Tooltip
                        formatter={(value) => [formatUSD(Number(value)), "Ingreso"]}
                        labelFormatter={(f) => formatFecha(String(f))}
                      />
                      <Line
                        type="monotone"
                        dataKey="ingreso_usd"
                        stroke="#1B2A5E"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#D4AF37" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalle de ingresos */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Detalle de ingresos</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/admin/pedidos">
                  Ver todo el historial
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-outline-variant bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
                      <th className="px-4 py-2 font-medium">Fecha</th>
                      <th className="px-4 py-2 font-medium">Tracking</th>
                      <th className="px-4 py-2 font-medium">Titular</th>
                      <th className="px-4 py-2 text-right font-medium">Valor</th>
                      <th className="px-4 py-2 text-right font-medium">Costo</th>
                      <th className="px-4 py-2 font-medium">Estado</th>
                      <th className="px-4 py-2 font-medium">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                        </td>
                      </tr>
                    ) : detalle.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-on-surface-muted">
                          Sin ingresos registrados.
                        </td>
                      </tr>
                    ) : (
                      detalle.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-outline-variant/60 last:border-0"
                        >
                          <td className="px-4 py-2.5 text-on-surface-variant">
                            {formatFecha(p.creado_en)}
                          </td>
                          <td className="px-4 py-2.5 text-on-surface-variant">{p.num_tracking}</td>
                          <td className="px-4 py-2.5 text-foreground">{p.titular}</td>
                          <td className="px-4 py-2.5 text-right text-on-surface-variant">
                            {formatUSD(p.valor_usd)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-foreground">
                            {formatUSD(p.costo_importacion_usd)}
                          </td>
                          <td className="px-4 py-2.5">
                            <EstadoBadge estado={p.estado} />
                          </td>
                          <td className="px-4 py-2.5">
                            {p.estado_pago === "liquidado" ? (
                              <PagoBadge estado="liquidado" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => liquidar(p)}
                                disabled={liquidandoId === p.id}
                                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 disabled:opacity-50"
                                title="Marcar como liquidado"
                              >
                                {liquidandoId === p.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                Liquidar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del período */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Resumen del período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Fila label="Total de pedidos" valor={String(resumen?.total_pedidos ?? 0)} fuerte />
            <div className="border-t border-outline-variant" />
            {desglose.length === 0 ? (
              <p className="text-sm text-on-surface-muted">Sin pedidos en el período.</p>
            ) : (
              desglose.map((d) => (
                <Fila
                  key={d.tipo_envio ?? "sin"}
                  label={`Método ${d.tipo_envio ? TIPO_ENVIO_LABEL[d.tipo_envio] : "Sin asignar"}`}
                  valor={`${d.cantidad} ${d.cantidad === 1 ? "pedido" : "pedidos"}`}
                />
              ))
            )}
            <div className="border-t border-outline-variant" />
            <div>
              <p className="text-xs uppercase tracking-wide text-on-surface-muted">
                Ingreso total USD
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatUSD(resumen?.ingreso_total_usd ?? 0)}
              </p>
            </div>
            <Button onClick={onExportar} disabled={exportando} className="w-full">
              {exportando ? <Loader2 className="animate-spin" /> : <Download />}
              Exportar período
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- subcomponentes ---------- */
function KpiCard({
  titulo,
  valor,
  extra,
}: {
  titulo: string;
  valor: string;
  extra: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-on-surface-variant">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-3xl font-bold text-primary">{valor}</p>
        <p className="text-xs">{extra}</p>
      </CardContent>
    </Card>
  );
}

function Fila({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className={fuerte ? "font-bold text-foreground" : "font-medium text-foreground"}>
        {valor}
      </span>
    </div>
  );
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
