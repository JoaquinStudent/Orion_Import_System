"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Clock,
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
    texto: "Traemos tus compras de Estados Unidos hasta tu puerta, sin complicaciones ni sorpresas.",
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

const CONFIANZA = [
  { icon: ShieldCheck, texto: "Cada paquete asegurado y rastreado" },
  { icon: Clock, texto: "Respuesta y atención por WhatsApp" },
  { icon: PackageSearch, texto: "Visibilidad total de tu envío" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/** Landing pública de Orión Logistic. */
export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="overflow-hidden bg-navy text-white">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center md:py-28"
        >
          <motion.span
            variants={fadeUp}
            className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.08em] text-navy-soft"
          >
            Courier internacional · Perú
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl"
          >
            Importamos desde EE.UU. <span className="text-gold">hasta tu puerta</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl leading-relaxed text-navy-soft">
            Comprá en Estados Unidos y nosotros nos encargamos del resto: recepción,
            desaduanaje, logística y entrega a nivel nacional. Cotizá en segundos y seguí
            tu paquete en cada paso.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="transition-transform hover:scale-105">
              <Link href="/cotizar">
                Cotizá tu envío
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/rastrear">Rastrear mi pedido</Link>
            </Button>
          </motion.div>

          {/* Franja de confianza */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-navy-soft"
          >
            {CONFIANZA.map((c) => {
              const Icon = c.icon;
              return (
                <span key={c.texto} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold" />
                  {c.texto}
                </span>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Servicios destacados */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-primary">¿Por qué Orión Logistic?</h2>
          <p className="mt-1 text-on-surface-variant">
            Todo lo que necesitás para importar tranquilo, en un solo lugar.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SERVICIOS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.titulo} variants={fadeUp}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col items-start gap-3 pt-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="font-semibold text-foreground">{s.titulo}</h3>
                    <p className="text-sm text-on-surface-variant">{s.texto}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container px-6 py-12 text-center"
        >
          <h2 className="text-2xl font-bold text-primary">
            ¿Listo para tu próxima importación?
          </h2>
          <p className="max-w-md text-on-surface-variant">
            Obtené una cotización estimada al instante, sin compromiso. Te acompañamos
            hasta que el paquete esté en tus manos.
          </p>
          <Button asChild size="lg" className="transition-transform hover:scale-105">
            <Link href="/cotizar">
              Cotizar ahora
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
