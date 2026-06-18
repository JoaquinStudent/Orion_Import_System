import type { EstadoRef } from "@/types/estado";

/**
 * Badge de estado de pedido. Usa el color que viene del backend (cada estado
 * trae su propio color), así funciona también con estados personalizados.
 */
export function EstadoBadge({ estado }: { estado: EstadoRef }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: estado.color, backgroundColor: `${estado.color}1A` }}
    >
      {estado.nombre}
    </span>
  );
}
