import Image from "next/image";

/** Footer de las páginas públicas. */
export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface-container-low">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center">
        <Image
          src="/logo.svg"
          alt="Orión Logistic"
          width={188}
          height={128}
          className="h-32 w-auto"
        />
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
