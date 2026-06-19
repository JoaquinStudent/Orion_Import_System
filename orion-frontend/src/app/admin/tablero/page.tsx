"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Loader2, Settings2 } from "lucide-react";

import { obtenerTablero } from "@/lib/services/estados";
import { cambiarEstadoPedido, cambiarCostoImportacion } from "@/lib/services/pedidos";
import { formatUSD } from "@/lib/format";
import type { TableroColumna, TableroPedidoCard } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CostoModal = { pedidoId: number; estadoId: number; card: TableroPedidoCard };
type MoveVars = { pedidoId: number; estadoId: number; card: TableroPedidoCard };

export default function TableroPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<number | null>(null);
  const [costoModal, setCostoModal] = useState<CostoModal | null>(null);
  const [costoInput, setCostoInput] = useState("");

  // El backend ya excluye los entregados archivados; se consultan en /admin/tablero/archivados.
  const tableroQ = useQuery({ queryKey: ["tablero"], queryFn: () => obtenerTablero() });
  const columnas: TableroColumna[] = tableroQ.data ?? [];
  const loading = tableroQ.isLoading;

  // Movimiento optimista: escribe en la cache ["tablero"], revierte si el back falla.
  const estadoMut = useMutation({
    mutationFn: ({ pedidoId, estadoId }: MoveVars) => cambiarEstadoPedido(pedidoId, estadoId),
    onMutate: async ({ pedidoId, estadoId, card }) => {
      await queryClient.cancelQueries({ queryKey: ["tablero"] });
      const prev = queryClient.getQueryData<TableroColumna[]>(["tablero"]);
      queryClient.setQueryData<TableroColumna[]>(["tablero"], (old) =>
        (old ?? []).map((c) => {
          if (c.pedidos.some((p) => p.id === pedidoId)) {
            return { ...c, pedidos: c.pedidos.filter((p) => p.id !== pedidoId) };
          }
          if (c.id === estadoId) return { ...c, pedidos: [...c.pedidos, card] };
          return c;
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tablero"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tablero"] }),
  });

  const costoMut = useMutation({
    mutationFn: ({ pedidoId, costo }: { pedidoId: number; costo: number }) =>
      cambiarCostoImportacion(pedidoId, costo),
  });
  const savingCosto = costoMut.isPending;

  function moverPedido(pedidoId: number, estadoId: number, card: TableroPedidoCard) {
    estadoMut.mutate({ pedidoId, estadoId, card });
  }

  function handleDrop(estadoId: number) {
    const pedidoId = dragId;
    setOverCol(null);
    setDragId(null);
    if (pedidoId == null) return;

    const origen = columnas.find((c) => c.pedidos.some((p) => p.id === pedidoId));
    if (!origen || origen.id === estadoId) return;
    const card = origen.pedidos.find((p) => p.id === pedidoId);
    if (!card) return;

    // El estado final es la última columna; el penúltimo, la anteúltima.
    const finalId = columnas[columnas.length - 1]?.id;
    const penultId = columnas[columnas.length - 2]?.id;

    // No se puede entregar un pedido cuyo pago no está liquidado.
    if (estadoId === finalId && card.estado_pago !== "liquidado") {
      toast.error("Liquidá el pago antes de marcar el pedido como entregado.");
      return;
    }

    // Al penúltimo estado se exige cargar el costo de importación.
    if (estadoId === penultId && card.costo_importacion_usd <= 0) {
      setCostoModal({ pedidoId, estadoId, card });
      setCostoInput("");
      return;
    }

    moverPedido(pedidoId, estadoId, card);
  }

  async function confirmarCosto() {
    if (!costoModal) return;
    const costo = Number(costoInput);
    if (!costoInput || isNaN(costo) || costo <= 0) {
      toast.error("Ingresá un costo de importación válido.");
      return;
    }
    try {
      await costoMut.mutateAsync({ pedidoId: costoModal.pedidoId, costo });
      moverPedido(costoModal.pedidoId, costoModal.estadoId, {
        ...costoModal.card,
        costo_importacion_usd: costo,
      });
      setCostoModal(null);
    } catch {
      // el toast de error global del MutationCache ya avisa
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Tablero</h1>
          <p className="text-sm text-on-surface-variant">
            Arrastrá las tarjetas para cambiar el estado de un pedido.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/tablero/archivados">
              <Archive />
              Ver archivados
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/tablero/estados">
              <Settings2 />
              Gestionar estados
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.id);
            }}
            className={`flex w-[80vw] max-w-xs shrink-0 flex-col rounded-xl border bg-surface-container-low transition-colors sm:w-72 ${
              overCol === col.id
                ? "border-primary bg-secondary/40"
                : "border-outline-variant"
            }`}
          >
            {/* Cabecera de columna */}
            <div className="flex items-center gap-2 border-b border-outline-variant px-3 py-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <span className="font-semibold text-foreground">{col.nombre}</span>
              <span className="ml-auto rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                {col.pedidos.length}
              </span>
            </div>

            {/* Tarjetas */}
            <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
              {col.pedidos.length === 0 ? (
                <p className="py-6 text-center text-xs text-on-surface-muted">
                  Sin pedidos
                </p>
              ) : (
                col.pedidos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      setDragId(p.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(p.id));
                    }}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => router.push(`/admin/pedidos/${p.id}`)}
                    className={`cursor-grab rounded-lg border border-outline-variant bg-white p-3 text-left shadow-sm transition active:cursor-grabbing hover:border-primary ${
                      dragId === p.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {p.num_tracking}
                    </div>
                    <div className="truncate text-xs text-on-surface-variant">
                      {p.titular}
                    </div>
                    <div className="mt-1 text-xs font-medium text-primary">
                      {p.costo_importacion_usd > 0
                        ? formatUSD(p.costo_importacion_usd)
                        : "Sin costo"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: capturar costo de importación al pasar al penúltimo estado */}
      {costoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingCosto && setCostoModal(null)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-bold text-primary">Costo de importación</h2>
              <p className="text-sm text-on-surface-variant">
                Cargá el costo de <strong>{costoModal.card.num_tracking}</strong> para
                avanzar a este estado.
              </p>
            </div>
            <Input
              type="number"
              step="0.01"
              autoFocus
              placeholder="0.00"
              value={costoInput}
              onChange={(e) => setCostoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmarCosto()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCostoModal(null)}
                disabled={savingCosto}
              >
                Cancelar
              </Button>
              <Button onClick={confirmarCosto} disabled={savingCosto}>
                {savingCosto && <Loader2 className="animate-spin" />}
                Guardar y mover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
