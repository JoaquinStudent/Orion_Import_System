import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { DocPage } from "@/components/cliente/DocPage";
import { Button } from "@/components/ui/button";
import { EMPRESA } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones — Orión Logistic",
  description: "Libro de Reclamaciones virtual de Orión Logistic conforme al Código de Protección al Consumidor.",
};

export default function LibroReclamacionesPage() {
  return (
    <DocPage
      titulo="Libro de Reclamaciones"
      descripcion="Conforme al Código de Protección y Defensa del Consumidor, ponemos a tu disposición nuestro Libro de Reclamaciones virtual."
      borrador
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-outline-variant bg-white p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <BookOpen className="h-7 w-7" />
        </span>
        <p className="max-w-md text-sm">
          [PENDIENTE] Integrar el formulario oficial del Libro de Reclamaciones (hoja de reclamación
          / queja con los datos del consumidor, del bien o servicio y el detalle).
        </p>
        {EMPRESA.libroReclamacionesUrl ? (
          <Button asChild className="btn-cta">
            <a href={EMPRESA.libroReclamacionesUrl} target="_blank" rel="noopener noreferrer">
              Abrir formulario
              <ExternalLink />
            </a>
          </Button>
        ) : (
          <p className="text-xs text-on-surface-muted">
            Falta la URL del formulario oficial (ver SOLICITUD_CLIENTE.md).
          </p>
        )}
      </div>
    </DocPage>
  );
}
