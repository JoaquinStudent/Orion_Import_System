import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  PackageSearch,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SERVICIOS = [
  {
    icon: Truck,
    titulo: "Importación desde EE.UU.",
    texto: "Traemos tus compras de Estados Unidos hasta tu puerta, sin complicaciones.",
  },
  {
    icon: PackageSearch,
    titulo: "Seguimiento en tiempo real",
    texto: "Conocé el estado de tu pedido en cada etapa, desde la recepción hasta la entrega.",
  },
  {
    icon: Calculator,
    titulo: "Cotización al instante",
    texto: "Calculá el costo de tu envío en segundos según el peso y el valor declarado.",
  },
  {
    icon: ShieldCheck,
    titulo: "Gestión confiable",
    texto: "Desaduanaje y logística gestionados por un equipo que cuida cada paquete.",
  },
];

/** Landing pública de Orión Logistic (Sprint 3). */
export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.08em] text-navy-soft">
            Orión Logistic
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Importamos desde EE.UU. <span className="text-gold">hasta tu puerta</span>
          </h1>
          <p className="max-w-xl leading-relaxed text-navy-soft">
            Gestión logística integral y seguimiento de tus paquetes a nivel
            nacional. Cotizá tu envío en segundos y dejá el resto en nuestras manos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/cotizar">
                Cotizá tu envío
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/admin/login">Acceso al panel</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-primary">¿Por qué Orión Logistic?</h2>
          <p className="mt-1 text-on-surface-variant">
            Todo lo que necesitás para importar tranquilo, en un solo lugar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.titulo} className="h-full">
                <CardContent className="flex flex-col items-start gap-3 pt-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-semibold text-foreground">{s.titulo}</h3>
                  <p className="text-sm text-on-surface-variant">{s.texto}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-primary">
            ¿Listo para tu próxima importación?
          </h2>
          <p className="max-w-md text-on-surface-variant">
            Obtené una cotización estimada al instante, sin compromiso.
          </p>
          <Button asChild size="lg">
            <Link href="/cotizar">
              Cotizar ahora
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
