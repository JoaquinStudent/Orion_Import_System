import type { Metadata } from "next";
import { DocPage } from "@/components/cliente/DocPage";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Orión Logistic",
  description: "Términos y condiciones del servicio de importación y courier de Orión Logistic.",
};

export default function TerminosPage() {
  return (
    <DocPage titulo="Términos y Condiciones" borrador>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">1. Del servicio</h2>
        <p className="text-sm">
          [PENDIENTE] Descripción del servicio de importación y courier, alcance y limitaciones.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">2. Responsabilidades del cliente</h2>
        <p className="text-sm">
          [PENDIENTE] Veracidad de los datos, productos permitidos, tributos de importación, etc.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">3. Tiempos de entrega y costos</h2>
        <p className="text-sm">
          [PENDIENTE] Plazos estimados, condiciones de la cotización, casos de fuerza mayor.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">4. Limitación de responsabilidad</h2>
        <p className="text-sm">[PENDIENTE] Seguros, pérdidas, daños, productos prohibidos.</p>
      </section>
    </DocPage>
  );
}
