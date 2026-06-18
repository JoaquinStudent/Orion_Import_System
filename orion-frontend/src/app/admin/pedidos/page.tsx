"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Eye, Loader2, PackageOpen } from "lucide-react";

import { listarPedidos } from "@/lib/services/pedidos";
import { listarEstados } from "@/lib/services/estados";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { TIPO_ENVIO_LABEL } from "@/lib/constants";
import type { Estado } from "@/types/estado";
import type { Paginated, PedidoListItem } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";

const PAGE_SIZE = 10;

export default function PedidosPage() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [data, setData] = useState<Paginated<PedidoListItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [estadoId, setEstadoId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);

  // Carga inicial de estados (para el filtro).
  useEffect(() => {
    listarEstados()
      .then(setEstados)
      .catch(() => {
        /* el filtro queda sin opciones; no es bloqueante */
      });
  }, []);

  // Debounce de la búsqueda: espera a que el usuario deje de tipear.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Al cambiar filtros o búsqueda, volver a la primera página.
  useEffect(() => {
    setPage(0);
  }, [debounced, estadoId]);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarPedidos({
        search: debounced || undefined,
        estado_id: estadoId,
        page,
        size: PAGE_SIZE,
      });
      setData(res);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar los pedidos"));
    } finally {
      setLoading(false);
    }
  }, [debounced, estadoId, page]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const total = data?.total_elements ?? 0;
  const desde = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE + PAGE_SIZE, total);
  const totalPages = data?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
          <p className="text-sm text-on-surface-variant">
            Gestioná y hacé seguimiento de las importaciones.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pedidos/nuevo">
            <Plus />
            Nuevo pedido
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titular, orden o tracking…"
            className="pl-9"
          />
        </div>
        <select
          value={estadoId ?? ""}
          onChange={(e) =>
            setEstadoId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="h-11 rounded-lg border border-outline-variant bg-white px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:w-56"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-3 font-medium">Orden / Tracking</th>
                <th className="px-4 py-3 font-medium">Titular</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Envío</th>
                <th className="px-4 py-3 text-right font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-on-surface-muted">
                    <PackageOpen className="mx-auto mb-2 h-8 w-8 opacity-60" />
                    No hay pedidos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                data.content.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-outline-variant/60 last:border-0 hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.num_orden}</div>
                      <div className="text-xs text-on-surface-muted">{p.num_tracking}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.titular}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {p.tipo_envio ? TIPO_ENVIO_LABEL[p.tipo_envio] : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatUSD(p.costo_importacion_usd)}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {formatFecha(p.creado_en)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/pedidos/${p.id}`} aria-label="Ver detalle">
                          <Eye />
                          Ver
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3 text-sm text-on-surface-variant">
          <span>
            {total === 0
              ? "Sin resultados"
              : `Mostrando ${desde}–${hasta} de ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <span className="px-1">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
