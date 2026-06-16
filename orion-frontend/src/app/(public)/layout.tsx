import { WhatsAppButton } from "@/components/cliente/WhatsAppButton";

/**
 * Layout de la app pública (cliente).
 * En Sprint 1 solo monta el botón flotante de WhatsApp; la navbar/footer y las
 * pantallas (landing, cotizador, rastreador) llegan en sprints siguientes.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      {children}
      <WhatsAppButton />
    </div>
  );
}
