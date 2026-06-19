"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
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

import { obtenerDashboardResumen } from "@/lib/services/dashboard";
import { obtenerResumen, exportarExcel } from "@/lib/services/finanzas";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { puedeVer } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardResumen } from "@/types/dashboard";
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
  const { usuario, loading: authLoading } = useAuth();
  const verPedidos = puedeVer(usuario, "pedidos");
  const verFinanzas = puedeVer(usuario, "finanzas");
  const [exportando, setExportando] = useState(false);

  const hoy = new Date();
  const inicioMes = ymd(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  // Cada query se gatea por permiso (enabled) para no provocar 403 a un EMPLEADO.
  const dashboardQ = useQuery({
    queryKey: ["dashboard-resumen"],
    queryFn: obtenerDashboardResumen,
    enabled: !authLoading && verPedidos,
  });
  const resumenQ = useQuery({
    queryKey: ["finanzas", "resumen", "dashboard-mes"],
    queryFn: () => obtenerResumen({ periodo: "dia", desde: inicioMes, hasta: ymd(hoy) }),
    enabled: !authLoading && verFinanzas,
  });

  const data: DashboardResumen | null = dashboardQ.data ?? null;
  const resumen: FinanzasResumen | null = resumenQ.data ?? null;
  const loading = authLoading || dashboardQ.isLoading || resumenQ.isLoading;
  const ultimos = data?.ultimos ?? [];

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
        <Kpi icon={Package} color="#0C447C" label="Pedidos hoy" valor={data?.pedidos_hoy ?? 0} />
        <Kpi icon={Truck} color="#854F0B" label="En tránsito" valor={data?.en_transito ?? 0} />
        <Kpi icon={Landmark} color="#3C3489" label="En aduana" valor={data?.en_aduana ?? 0} />
        <Kpi icon={CheckCircle2} color="#085041" label="Entregados (mes)" valor={data?.entregados_mes ?? 0} />
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
