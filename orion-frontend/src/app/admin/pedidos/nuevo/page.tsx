"use client";

"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { crearPedido } from "@/lib/services/pedidos";
import type { PedidoInput } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { PedidoForm } from "@/components/pedidos/PedidoForm";

export default function NuevoPedidoPage() {
  const queryClient = useQueryClient();
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

      <PedidoForm
        mode="crear"
        onSubmit={async (input: PedidoInput) => {
          const creado = await crearPedido(input);
          queryClient.invalidateQueries({ queryKey: ["pedidos"] });
          queryClient.invalidateQueries({ queryKey: ["tablero"] });
          return creado;
        }}
        cancelHref="/admin/pedidos"
      />
    </div>
  );
}
