"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Lock } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { obtenerResumen, exportarExcel } from "@/lib/services/finanzas";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { puedeVer } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { FinanzasQuery, FinanzasResumen } from "@/types/finanzas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const selectClass =
  "h-11 rounded-lg border border-outline-variant bg-white px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

export default function FinanzasPage() {
  const { usuario, loading: authLoading } = useAuth();
  const [resumen, setResumen] = useState<FinanzasResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<FinanzasQuery["periodo"]>("mes");
  const [exportando, setExportando] = useState(false);

  const permitido = puedeVer(usuario, "finanzas");

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      setResumen(await obtenerResumen({ periodo }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo cargar el resumen"));
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    if (!authLoading && permitido) fetchResumen();
  }, [authLoading, permitido, fetchResumen]);

  async function onExportar() {
    setExportando(true);
    try {
      await exportarExcel({ periodo });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo exportar"));
    } finally {
      setExportando(false);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Finanzas</h1>
          <p className="text-sm text-on-surface-variant">
            Ingresos por importaciones (en USD).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as FinanzasQuery["periodo"])}
            className={selectClass}
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="anio">Por año</option>
          </select>
          <Button onClick={onExportar} disabled={exportando} variant="secondary">
            {exportando ? <Loader2 className="animate-spin" /> : <Download />}
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-on-surface-variant">
              Ingreso total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {resumen ? formatUSD(resumen.ingreso_total_usd) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-on-surface-variant">
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {resumen ? resumen.total_pedidos : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingresos por período</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !resumen || resumen.serie.length === 0 ? (
            <p className="py-20 text-center text-sm text-on-surface-muted">
              Todavía no hay ingresos para mostrar.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumen.serie} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
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
                  <Bar dataKey="ingreso_usd" fill="#1B2A5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
