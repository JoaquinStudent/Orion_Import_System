"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  Truck,
  Landmark,
  CheckCircle2,
  Plus,
  Download,
  Kanban,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

import { listarPedidos } from "@/lib/services/pedidos";
import { obtenerResumen, exportarExcel } from "@/lib/services/finanzas";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import type { PedidoListItem } from "@/types/pedido";
import type { FinanzasResumen } from "@/types/finanzas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoListItem[]>([]);
  const [resumen, setResumen] = useState<FinanzasResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const inicioMes = ymd(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    Promise.all([
      listarPedidos({ size: 200 }),
      obtenerResumen({ periodo: "dia", desde: inicioMes, hasta: ymd(hoy) }),
    ])
      .then(([p, r]) => {
        setPedidos(p.content);
        setResumen(r);
      })
      .catch((e) => toast.error(getApiErrorMessage(e, "No se pudo cargar el dashboard")))
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => {
    const hoy = ymd(new Date());
    const mes = hoy.slice(0, 7);
    const cuenta = (fn: (p: PedidoListItem) => boolean) => pedidos.filter(fn).length;
    return {
      hoy: cuenta((p) => p.creado_en.slice(0, 10) === hoy),
      transito: cuenta((p) => p.estado.nombre === "En tránsito"),
      aduana: cuenta((p) => p.estado.nombre === "En aduana"),
      entregadosMes: cuenta(
        (p) => p.estado.nombre === "Entregado" && p.creado_en.slice(0, 7) === mes
      ),
    };
  }, [pedidos]);

  const ultimos = useMemo(
    () =>
      [...pedidos]
        .sort((a, b) => b.creado_en.localeCompare(a.creado_en))
        .slice(0, 6),
    [pedidos]
  );

  async function onExportar() {
    setExportando(true);
    try {
      await exportarExcel({ periodo: "mes" });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudo exportar"));
    } finally {
      setExportando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {saludo()}, {usuario?.nombre?.split(" ")[0] ?? ""} 👋
        </h1>
        <p className="text-sm text-on-surface-variant">Resumen general de la operación.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Package} color="#0C447C" label="Pedidos hoy" valor={kpis.hoy} />
        <Kpi icon={Truck} color="#854F0B" label="En tránsito" valor={kpis.transito} />
        <Kpi icon={Landmark} color="#3C3489" label="En aduana" valor={kpis.aduana} />
        <Kpi icon={CheckCircle2} color="#085041" label="Entregados (mes)" valor={kpis.entregadosMes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Últimos pedidos */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Últimos pedidos</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link href="/admin/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {ultimos.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-on-surface-muted">
                Todavía no hay pedidos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-outline-variant bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
                      <th className="px-4 py-2 font-medium">Tracking</th>
                      <th className="px-4 py-2 font-medium">Titular</th>
                      <th className="px-4 py-2 font-medium">Estado</th>
                      <th className="px-4 py-2 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimos.map((p) => (
                      <tr key={p.id} className="border-b border-outline-variant/60 last:border-0">
                        <td className="px-4 py-2.5 text-on-surface-variant">{p.num_tracking}</td>
                        <td className="px-4 py-2.5 text-foreground">{p.titular}</td>
                        <td className="px-4 py-2.5"><EstadoBadge estado={p.estado} /></td>
                        <td className="px-4 py-2.5 text-right font-medium text-foreground">
                          {formatUSD(p.costo_importacion_usd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingresos + acciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-on-surface-variant">
                Ingresos este mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {resumen ? formatUSD(resumen.ingreso_total_usd) : "—"}
              </p>
              {resumen && resumen.serie.length > 0 && (
                <div className="mt-3 h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resumen.serie}>
                      <XAxis dataKey="fecha" hide />
                      <Tooltip
                        formatter={(v) => [formatUSD(Number(v)), "Ingreso"]}
                        labelFormatter={(f) => formatFecha(String(f))}
                      />
                      <Bar dataKey="ingreso_usd" fill="#1B2A5E" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-on-surface-variant">
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/pedidos/nuevo"><Plus />Nuevo pedido</Link>
              </Button>
              <Button onClick={onExportar} disabled={exportando} variant="outline" className="w-full justify-start">
                {exportando ? <Loader2 className="animate-spin" /> : <Download />}
                Exportar Excel
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/tablero"><Kanban />Ver tablero</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  color,
  label,
  valor,
}: {
  icon: typeof Package;
  color: string;
  label: string;
  valor: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-2xl font-bold text-primary">{valor}</p>
          <p className="text-xs text-on-surface-variant">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
