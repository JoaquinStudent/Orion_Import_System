import type { Metadata } from "next";
import { SolicitudForm } from "@/components/cliente/SolicitudForm";

export const metadata: Metadata = {
  title: "Registrá tu pedido · Orión Logistic",
  description:
    "Registrá tu pedido de importación vos mismo. Lo revisamos y lo sumamos a tu seguimiento.",
};

export default function RegistrarPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Registrá tu pedido</h1>
        <p className="mt-2 text-on-surface-variant">
          Completá los datos de tu compra. Nuestro equipo la revisa antes de procesarla, así
          evitamos errores. No necesitás conocer el costo de importación: lo calculamos nosotros.
        </p>
      </header>
      <SolicitudForm />
    </main>
  );
}
