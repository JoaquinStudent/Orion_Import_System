import type { Metadata } from "next";
import { DocPage } from "@/components/cliente/DocPage";

export const metadata: Metadata = {
  title: "Política de Privacidad — Orión Logistic",
  description:
    "Cómo Orión Logistic trata y protege los datos personales de sus clientes (Ley N.º 29733).",
};

export default function PrivacidadPage() {
  return (
    <DocPage titulo="Política de Privacidad" borrador>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">1. Datos que recopilamos</h2>
        <p className="text-sm">[PENDIENTE] Nombre, contacto, WhatsApp, datos del pedido, etc.</p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">2. Finalidad del tratamiento</h2>
        <p className="text-sm">[PENDIENTE] Gestión del pedido, comunicación, mejoras del servicio.</p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">3. Derechos del titular</h2>
        <p className="text-sm">
          [PENDIENTE] Derechos ARCO conforme a la Ley N.º 29733 de Protección de Datos Personales y
          cómo ejercerlos.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-semibold text-primary">4. Contacto</h2>
        <p className="text-sm">[PENDIENTE] Canal para consultas sobre datos personales.</p>
      </section>
    </DocPage>
  );
}
