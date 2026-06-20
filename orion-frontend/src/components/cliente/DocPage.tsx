import { AlertTriangle } from "lucide-react";

/** Layout simple para páginas estáticas/informativas (Nosotros, legales, etc.). */
export function DocPage({
  titulo,
  descripcion,
  borrador = false,
  children,
}: {
  titulo: string;
  descripcion?: string;
  /** Muestra un aviso de "contenido de ejemplo" (para páginas legales pendientes). */
  borrador?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-primary">{titulo}</h1>
      {descripcion && <p className="mt-2 text-on-surface-variant">{descripcion}</p>}

      {borrador && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Contenido de ejemplo. Reemplazar con el texto legal oficial proporcionado por la empresa
            antes de publicar.
          </span>
        </div>
      )}

      <div className="mt-8 space-y-6 text-on-surface-variant">{children}</div>
    </main>
  );
}
