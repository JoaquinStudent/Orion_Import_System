import { WhatsAppButton } from "@/components/cliente/WhatsAppButton";
import { PublicNavbar } from "@/components/cliente/PublicNavbar";
import { PublicFooter } from "@/components/cliente/PublicFooter";

/**
 * Layout de la app pública (cliente): navbar + contenido + footer, con el
 * botón flotante de WhatsApp en todas las pantallas (landing, cotizador…).
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicNavbar />
      <div className="flex-1">{children}</div>
      <PublicFooter />
      <WhatsAppButton />
    </div>
  );
}
