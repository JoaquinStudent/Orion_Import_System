"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  PackageX,
  MessageCircle,
  CheckCircle2,
  Undo2,
} from "lucide-react";

import { obtenerPedido, eliminarPedido, cambiarEstadoPago } from "@/lib/services/pedidos";
import { formatUSD, formatFecha, whatsappLink } from "@/lib/format";
import { TIPO_ENVIO_LABEL } from "@/lib/constants";
import type { Pedido } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";
import { PagoBadge } from "@/components/pedidos/PagoBadge";

export default function DetallePedidoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const pedidoQ = useQuery({
    queryKey: ["pedido", id],
    queryFn: () => obtenerPedido(id),
    enabled: Number.isFinite(id),
  });
  const pedido: Pedido | null = pedidoQ.data ?? null;
  const loading = pedidoQ.isLoading;
  const notFound = pedidoQ.isError;

  const pagoMut = useMutation({
    mutationFn: (nuevo: "pendiente" | "liquidado") => cambiarEstadoPago(id, nuevo),
    onSuccess: (actualizado, nuevo) => {
      queryClient.setQueryData(["pedido", id], actualizado);
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["tablero"] });
      queryClient.invalidateQueries({ queryKey: ["finanzas"] });
      toast.success(
        nuevo === "liquidado" ? "Pago marcado como liquidado" : "Pago vuelto a pendiente"
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => eliminarPedido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["tablero"] });
      toast.success("Pedido eliminado");
      router.push("/admin/pedidos");
    },
  });

  function onTogglePago() {
    if (!pedido) return;
    pagoMut.mutate(pedido.estado_pago === "liquidado" ? "pendiente" : "liquidado");
  }

  function onDelete() {
    if (!window.confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return;
    deleteMut.mutate();
  }

  const pagando = pagoMut.isPending;
  const deleting = deleteMut.isPending;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !pedido) {
    return (
      <div className="mx-auto max-w-md py-24 text-center text-on-surface-muted">
        <PackageX className="mx-auto mb-3 h-10 w-10 opacity-60" />
        <p className="mb-4">No encontramos ese pedido.</p>
        <Button asChild variant="outline">
          <Link href="/admin/pedidos">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  const waMensaje = `Hola ${pedido.titular}, te escribimos de Orión Logistic por tu pedido ${pedido.num_orden}.`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/pedidos" aria-label="Volver">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">{pedido.num_tracking}</h1>
            <EstadoBadge estado={pedido.estado} />
          </div>
          <p className="text-sm text-on-surface-variant">
            Orden {pedido.num_orden}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="whatsapp" size="sm">
            <a href={whatsappLink(pedido.whatsapp, waMensaje)} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/pedidos/${pedido.id}/editar`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Eliminar
          </Button>
        </div>
      </div>

      {/* Datos generales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DataRow label="Titular" value={pedido.titular} />
          <DataRow label="Consignatario" value={pedido.consignatario} />
          <DataRow label="Comunidad" value={pedido.comunidad} />
          <DataRow label="Firma" value={pedido.firma} />
          <DataRow label="WhatsApp" value={pedido.whatsapp} />
          <DataRow
            label="Tipo de envío"
            value={pedido.tipo_envio ? TIPO_ENVIO_LABEL[pedido.tipo_envio] : null}
          />
        </CardContent>
      </Card>

      {/* Importación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DataRow label="Valor declarado" value={formatUSD(pedido.valor_usd)} />
          <DataRow
            label="Costo de importación"
            value={formatUSD(pedido.costo_importacion_usd)}
          />
          <DataRow label="Registrado por" value={pedido.creado_por?.nombre} />
          <DataRow label="Fecha de registro" value={formatFecha(pedido.creado_en)} />
          {pedido.actualizado_en && (
            <DataRow
              label="Última actualización"
              value={formatFecha(pedido.actualizado_en)}
            />
          )}
        </CardContent>
      </Card>

      {/* Pago de la importación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pago de la importación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Estado del pago:</span>
            <PagoBadge estado={pedido.estado_pago} />
          </div>
          {pedido.estado_pago === "liquidado" ? (
            <Button variant="outline" size="sm" onClick={onTogglePago} disabled={pagando}>
              {pagando ? <Loader2 className="animate-spin" /> : <Undo2 />}
              Volver a pendiente
            </Button>
          ) : (
            <Button size="sm" onClick={onTogglePago} disabled={pagando}>
              {pagando ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Marcar como liquidado
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Productos */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            Productos ({pedido.productos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pedido.productos.length === 0 ? (
            <p className="px-6 py-6 text-sm text-on-surface-muted">
              Este pedido no tiene productos detallados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-outline-variant bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="px-6 py-2 font-medium">Cant.</th>
                    <th className="px-4 py-2 font-medium">Producto</th>
                    <th className="px-4 py-2 font-medium">Marca</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.productos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-outline-variant/60 last:border-0"
                    >
                      <td className="px-6 py-2.5 text-foreground">{p.cantidad}</td>
                      <td className="px-4 py-2.5 text-foreground">{p.producto}</td>
                      <td className="px-4 py-2.5 text-on-surface-variant">
                        {p.marca || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Par etiqueta/valor para mostrar un dato del pedido. */
function DataRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-on-surface-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}
