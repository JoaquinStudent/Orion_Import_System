import type { EstadoPago } from "@/types/pedido";

/** Badge del estado de pago de la importación (pendiente / liquidado). */
export function PagoBadge({ estado }: { estado: EstadoPago }) {
  const liquidado = estado === "liquidado";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        liquidado
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {liquidado ? "Liquidado" : "Pendiente"}
    </span>
  );
}
