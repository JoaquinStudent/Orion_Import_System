import type { Metadata } from "next";
import { XCircle, MessageCircle } from "lucide-react";
import { DocPage } from "@/components/cliente/DocPage";
import { Button } from "@/components/ui/button";
import { PRODUCTOS_PROHIBIDOS } from "@/lib/content/site";
import { whatsappLink } from "@/lib/format";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? "+51999999999";

export const metadata: Metadata = {
  title: "Productos prohibidos — Orión Logistic",
  description: "Lista referencial de productos que no se pueden importar a través de nuestro servicio.",
};

export default function ProductosProhibidosPage() {
  return (
    <DocPage
      titulo="Productos prohibidos"
      descripcion="Por normativa aduanera y de seguridad, no transportamos los siguientes productos. Es una lista referencial: ante cualquier duda, consultanos antes de comprar."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {PRODUCTOS_PROHIBIDOS.map((p) => (
          <li
            key={p}
            className="flex items-start gap-2 rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm text-foreground"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            {p}
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-surface-container p-5 text-center">
        <p className="text-sm">¿No estás seguro si tu producto se puede importar?</p>
        <Button asChild variant="whatsapp" className="btn-cta mt-3">
          <a
            href={whatsappLink(WA, "Hola, quiero consultar si puedo importar un producto.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle />
            Consultar por WhatsApp
          </a>
        </Button>
      </div>
    </DocPage>
  );
}
