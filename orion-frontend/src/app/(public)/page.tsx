"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bike,
  Calculator,
  ChevronDown,
  Clock,
  Home,
  MessageCircle,
  Package,
  PackageCheck,
  PackageSearch,
  Plane,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ESTADO_BADGES } from "@/lib/constants";
import { whatsappLink } from "@/lib/format";
import { obtenerConfigPublica } from "@/lib/services/config";
import { TESTIMONIOS, FAQ, COBERTURA } from "@/lib/content/site";

const COBERTURA_ICONS = [Home, Bike, Truck];

const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? "+51999999999";

const STATS = [
  { icon: Package, valor: "+1.000", label: "PEDIDOS POR MES" },
  { icon: Clock, valor: "6–12", label: "DÍAS DE ENTREGA" },
  { icon: Warehouse, valor: "3", label: "ALMACENES EN MIAMI" },
  { icon: ShieldCheck, valor: "100%", label: "ENVÍOS SEGUROS" },
];

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

const PASOS = [
  { icon: Calculator, titulo: "COTIZÁ", texto: "Calculá el costo con el valor y el peso de tu producto, al instante." },
  { icon: ShoppingCart, titulo: "COMPRÁ", texto: "Comprá en Amazon, eBay o donde quieras y envialo a nuestro almacén de Miami." },
  { icon: Plane, titulo: "EMBARCAMOS", texto: "Recibimos, gestionamos la aduana y lo traemos a Perú en 6–12 días." },
  { icon: PackageCheck, titulo: "RECIBÍ", texto: "Lo retirás en almacén o te lo enviamos a Lima o a tu provincia." },
];

// Set por defecto (fallback si /estados no está disponible públicamente).
const ESTADOS_DEFAULT = ["Recibido", "En tránsito", "En aduana", "En almacén", "Entregado"];

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
  // Estados dinámicos reales (los que el admin haya creado), desde la config pública.
  // Si el backend aún no los expone, cae al set por defecto sin romper la página.
  const configQ = useQuery({
    queryKey: ["config-publica"],
    queryFn: obtenerConfigPublica,
    retry: false,
    staleTime: 5 * 60_000,
  });
  const dinamicos = [...(configQ.data?.estados ?? [])].sort((a, b) => a.orden - b.orden);
  const estadosBanda =
    dinamicos.length > 0
      ? dinamicos.map((e) => ({ nombre: e.nombre, bg: `${e.color}1A`, text: e.color }))
      : ESTADOS_DEFAULT.map((n) => ({ nombre: n, bg: ESTADO_BADGES[n].bg, text: ESTADO_BADGES[n].text }));

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="overflow-hidden bg-navy text-white">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center md:py-28"
        >
          <motion.span
            variants={fadeUp}
            className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold"
          >
            Courier internacional · Miami → Perú
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl"
          >
            Importamos desde EE.UU. <span className="text-gold">hasta tu puerta</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl leading-relaxed text-navy-soft">
            Comprá en Estados Unidos y nosotros nos encargamos del resto: recepción en Miami,
            desaduanaje, logística y entrega a nivel nacional. Cotizá en segundos y seguí tu paquete
            en cada paso.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="gold" className="btn-cta uppercase">
              <Link href="/cotizar">
                Cotizá tu envío
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="btn-cta uppercase">
              <Link href="/rastrear">Rastrear mi pedido</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="border-b border-outline-variant bg-white">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
          className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4"
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center text-center">
                <Icon className="mb-2 h-7 w-7 text-gold" />
                <span className="text-3xl font-bold text-primary">{s.valor}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ---------- Servicios ---------- */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Por qué Orión</p>
          <h2 className="text-2xl font-bold text-primary">Todo para importar tranquilo</h2>
          <p className="mt-1 text-on-surface-variant">Un solo lugar, de Miami a tu puerta.</p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
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

      {/* ---------- Cómo funciona (flujo animado) ---------- */}
      <section id="como-funciona" className="scroll-mt-20 bg-surface-container-low">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">El proceso</p>
            <h2 className="text-2xl font-bold uppercase text-primary md:text-3xl">¿Cómo funciona?</h2>
            <p className="mt-1 text-on-surface-variant">Cuatro pasos simples, nosotros hacemos el resto.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-4"
          >
            {/* Conector animado (solo md+) */}
            <motion.div
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: "easeOut" } } }}
              style={{ transformOrigin: "left" }}
              className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-0.5 origin-left bg-gold/40 md:block"
            />
            {PASOS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.titulo} variants={fadeUp} className="relative z-10 flex flex-col items-center text-center">
                  <span className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white shadow-lg ring-4 ring-surface-container-low">
                    <Icon className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="font-bold uppercase tracking-wide text-primary">{p.titulo}</h3>
                  <p className="mt-1 max-w-[14rem] text-sm text-on-surface-variant">{p.texto}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ---------- Seguimiento en tiempo real (estados) ---------- */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="rounded-2xl border border-outline-variant bg-white p-6 text-center md:p-10"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Transparencia total</p>
          <h2 className="text-2xl font-bold text-primary">Seguí tu pedido en tiempo real</h2>
          <p className="mx-auto mt-1 max-w-lg text-on-surface-variant">
            Desde que llega a Miami hasta que está en tus manos, mirá en qué etapa va tu paquete.
          </p>

          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 md:justify-center">
            {estadosBanda.map((e, i) => (
              <div key={e.nombre} className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: e.bg, color: e.text }}
                >
                  {e.nombre}
                </span>
                {i < estadosBanda.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-muted" />
                )}
              </div>
            ))}
          </div>

          <Button asChild size="lg" variant="secondary" className="btn-cta mt-8 uppercase">
            <Link href="/rastrear">
              Rastrear mi pedido
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* ---------- Cobertura ---------- */}
      <section id="cobertura" className="scroll-mt-20 bg-surface-container-low">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10 text-center"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Cobertura</p>
            <h2 className="text-2xl font-bold text-primary">Te llegamos a todo el Perú</h2>
            <p className="mt-1 text-on-surface-variant">Elegí cómo querés recibir tu paquete.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-3"
          >
            {COBERTURA.map((c, i) => {
              const Icon = COBERTURA_ICONS[i] ?? Truck;
              return (
                <motion.div key={c.zona} variants={fadeUp}>
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col items-center gap-3 pt-6 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="font-semibold text-foreground">{c.zona}</h3>
                      <p className="text-sm text-on-surface-variant">{c.detalle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ---------- Testimonios ---------- */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Testimonios</p>
          <h2 className="text-2xl font-bold text-primary">Miles de clientes ya confían en nosotros</h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIOS.map((t) => (
            <motion.div key={t.nombre} variants={fadeUp}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 pt-6">
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: t.estrellas }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm text-on-surface-variant">“{t.texto}”</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.nombre}</p>
                    <p className="text-xs text-on-surface-muted">{t.ciudad}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="bg-surface-container-low">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10 text-center"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Preguntas frecuentes</p>
            <h2 className="text-2xl font-bold text-primary">Resolvé tus dudas</h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="space-y-3"
          >
            {FAQ.map((f) => (
              <motion.details
                key={f.q}
                variants={fadeUp}
                className="group rounded-xl border border-outline-variant bg-white p-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-on-surface-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{f.a}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="bg-navy">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center text-white"
        >
          <h2 className="text-2xl font-bold uppercase md:text-3xl">¿Listo para importar?</h2>
          <p className="max-w-md text-navy-soft">
            Obtené una cotización estimada al instante, sin compromiso. Te acompañamos hasta que el
            paquete esté en tus manos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="gold" className="btn-cta uppercase">
              <Link href="/cotizar">
                Cotizar ahora
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="whatsapp" className="btn-cta">
              <a
                href={whatsappLink(WA, "Hola, quiero consultar por una importación.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle />
                Hablar por WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
