"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Eye, Loader2, Archive } from "lucide-react";

import { listarPedidos } from "@/lib/services/pedidos";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha } from "@/lib/format";
import { TIPO_ENVIO_LABEL } from "@/lib/constants";
import type { Paginated, PedidoListItem } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";
import { PagoBadge } from "@/components/pedidos/PagoBadge";

const PAGE_SIZE = 20;

export default function ArchivadosPage() {
  const [data, setData] = useState<Paginated<PedidoListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchArchivados = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listarPedidos({ archivados: true, page, size: PAGE_SIZE }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar los archivados"));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchArchivados();
  }, [fetchArchivados]);

  const total = data?.total_elements ?? 0;
  const desde = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE + PAGE_SIZE, total);
  const totalPages = data?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/tablero" aria-label="Volver al tablero">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Pedidos archivados</h1>
          <p className="text-sm text-on-surface-variant">
            Entregados y liquidados. Salieron del tablero pero siguen acá para consulta.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Tracking</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Titular</th>
                <th className="px-4 py-3 font-medium">Envío</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-right font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-on-surface-muted">
                    <Archive className="mx-auto mb-2 h-8 w-8 opacity-60" />
                    Todavía no hay pedidos archivados.
                  </td>
                </tr>
              ) : (
                data.content.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-outline-variant/60 last:border-0 hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3 text-on-surface-variant">{formatFecha(p.creado_en)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.num_tracking}</td>
                    <td className="px-4 py-3 text-on-surface-muted">{p.num_orden}</td>
                    <td className="px-4 py-3 text-foreground">{p.titular}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {p.tipo_envio ? TIPO_ENVIO_LABEL[p.tipo_envio] : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-variant">
                      {formatUSD(p.valor_usd)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatUSD(p.costo_importacion_usd)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <PagoBadge estado={p.estado_pago} />
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3 text-sm text-on-surface-variant">
          <span>
            {total === 0 ? "Sin resultados" : `Mostrando ${desde}–${hasta} de ${total}`}
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
