"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { crearPedido } from "@/lib/services/pedidos";
import { Button } from "@/components/ui/button";
import { PedidoForm } from "@/components/pedidos/PedidoForm";

export default function NuevoPedidoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/pedidos" aria-label="Volver">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Nuevo pedido</h1>
          <p className="text-sm text-on-surface-variant">
            Registrá una importación y sus productos.
          </p>
        </div>
      </div>

      <PedidoForm mode="crear" onSubmit={crearPedido} cancelHref="/admin/pedidos" />
    </div>
  );
}
