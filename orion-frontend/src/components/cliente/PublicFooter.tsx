import { Compass } from "lucide-react";

/** Footer de las páginas públicas. */
export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface-container-low">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">Orión Logistic</span>
        </div>
        <p className="text-sm text-on-surface-variant">
          Importaciones desde EE.UU. con seguimiento de punta a punta.
        </p>
        <p className="text-xs text-on-surface-muted">
          © {new Date().getFullYear()} Orión Logistic. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
