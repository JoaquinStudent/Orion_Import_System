"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, PackageX } from "lucide-react";

import { obtenerPedido, actualizarPedido } from "@/lib/services/pedidos";
import type { Pedido, PedidoInput } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { PedidoForm } from "@/components/pedidos/PedidoForm";

export default function EditarPedidoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPedido = useCallback(async () => {
    setLoading(true);
    try {
      setPedido(await obtenerPedido(id));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPedido();
  }, [fetchPedido]);

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/pedidos/${id}`} aria-label="Volver">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Editar pedido</h1>
          <p className="text-sm text-on-surface-variant">{pedido.num_orden}</p>
        </div>
      </div>

      <PedidoForm
        mode="editar"
        pedido={pedido}
        onSubmit={(input: PedidoInput) => actualizarPedido(id, input)}
        cancelHref={`/admin/pedidos/${id}`}
      />
    </div>
  );
}
