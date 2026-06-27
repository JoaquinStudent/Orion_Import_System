"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Loader2, Inbox, MessageCircle } from "lucide-react";

import {
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
} from "@/lib/services/solicitudes";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, formatFecha, whatsappLink } from "@/lib/format";
import type { Paginated } from "@/types/pedido";
import type { Solicitud } from "@/types/solicitud";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 10;

export default function SolicitudesPage() {
  const [page, setPage] = useState(0);
  const [accionId, setAccionId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ["solicitudes", { page }],
    queryFn: () => listarSolicitudes("pendiente", page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });
  const data: Paginated<Solicitud> | null = q.data ?? null;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    queryClient.invalidateQueries({ queryKey: ["solicitudes", "count"] });
  }

  const aprobarMut = useMutation({
    mutationFn: (id: number) => aprobarSolicitud(id),
    onMutate: (id) => setAccionId(id),
    onSuccess: (pedido) => {
      toast.success(`Pedido ${pedido.num_orden} creado`);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "No se pudo aprobar")),
    onSettled: () => setAccionId(null),
  });

  const rechazarMut = useMutation({
    mutationFn: (id: number) => rechazarSolicitud(id),
    onMutate: (id) => setAccionId(id),
    onSuccess: () => {
      toast.success("Solicitud rechazada");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "No se pudo rechazar")),
    onSettled: () => setAccionId(null),
  });

  const solicitudes = data?.content ?? [];
  const total = data?.total_elements ?? 0;
  const totalPages = data?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Solicitudes de clientes</h1>
        <p className="text-on-surface-variant">
          Pedidos registrados desde la landing. Al aprobar se crean como pedido real.
        </p>
      </header>

      <Card className="overflow-hidden">
        {q.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-on-surface-muted" />
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-on-surface-muted">
            <Inbox className="h-8 w-8" />
            <p>No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-surface-variant/40 text-left text-on-surface-variant">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Titular</th>
                  <th className="px-4 py-2.5 font-medium">Comunidad</th>
                  <th className="px-4 py-2.5 font-medium">Orden / Tracking</th>
                  <th className="px-4 py-2.5 font-medium">Productos</th>
                  <th className="px-4 py-2.5 text-right font-medium">Valor</th>
                  <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {solicitudes.map((s) => {
                  const busy = accionId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-surface-variant/20">
                      <td className="px-4 py-2.5 text-on-surface-variant">{formatFecha(s.creado_en)}</td>
                      <td className="px-4 py-2.5 text-foreground">
                        {s.titular}
                        <span className="block text-xs text-on-surface-muted">{s.whatsapp}</span>
                      </td>
                      <td className="px-4 py-2.5">{s.comunidad}</td>
                      <td className="px-4 py-2.5">
                        {s.num_orden}
                        <span className="block text-xs text-on-surface-muted">{s.num_tracking}</span>
                      </td>
                      <td className="px-4 py-2.5 text-on-surface-variant">
                        {s.productos.length === 0
                          ? "—"
                          : s.productos
                              .map((p) => `${p.cantidad}× ${p.producto}`)
                              .join(", ")}
                      </td>
                      <td className="px-4 py-2.5 text-right">{formatUSD(s.valor_usd)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="whatsapp">
                            <a
                              href={whatsappLink(
                                s.whatsapp,
                                `Hola ${s.titular}, te escribimos de Orión Logistic por tu pedido ${s.num_orden}.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => aprobarMut.mutate(s.id)}
                            disabled={busy}
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rechazarMut.mutate(s.id)}
                            disabled={busy}
                          >
                            <X className="h-3.5 w-3.5" />
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{total} pendientes</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
