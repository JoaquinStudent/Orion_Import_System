"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Loader2,
  Barcode,
  FileText,
  Home,
  Bike,
  Truck,
  Check,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

import { rastrear, elegirTipoEnvio } from "@/lib/services/rastreo";
import { getApiErrorMessage } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import type { RastreoResult } from "@/types/rastreo";
import type { TipoEnvio } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? "+51999999999";

const OPCIONES_ENVIO: { tipo: TipoEnvio; label: string; icon: typeof Home }[] = [
  { tipo: "almacen", label: "Recojo en almacén", icon: Home },
  { tipo: "lima", label: "Delivery en Lima", icon: Bike },
  { tipo: "shalom", label: "Provincia · Shalom", icon: Truck },
];

export default function RastrearPage() {
  const [tracking, setTracking] = useState("");
  const [orden, setOrden] = useState("");
  const [result, setResult] = useState<RastreoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [seleccion, setSeleccion] = useState<TipoEnvio | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function onBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (!tracking.trim() || !orden.trim()) {
      toast.error("Ingresá el tracking y la orden");
      return;
    }
    setLoading(true);
    try {
      const r = await rastrear({ num_tracking: tracking.trim(), num_orden: orden.trim() });
      setResult(r);
      setSeleccion(r.tipo_envio);
      setConfirmado(!r.puede_elegir_envio && r.tipo_envio !== null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo rastrear el pedido"));
    } finally {
      setLoading(false);
    }
  }

  async function onConfirmar() {
    if (!seleccion) {
      toast.error("Elegí cómo querés recibir tu pedido");
      return;
    }
    setConfirmando(true);
    try {
      const r = await elegirTipoEnvio({
        num_tracking: tracking.trim(),
        num_orden: orden.trim(),
        tipo_envio: seleccion,
      });
      setResult(r);
      setConfirmado(true);
      toast.success("¡Tipo de envío confirmado!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo confirmar"));
    } finally {
      setConfirmando(false);
    }
  }

  function buscarOtro() {
    setResult(null);
    setTracking("");
    setOrden("");
    setSeleccion(null);
    setConfirmado(false);
  }

  /* ---------- Estado 1: búsqueda ---------- */
  if (!result) {
    return (
      <main className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="pt-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <MapPin className="h-7 w-7" />
              </span>
              <h1 className="text-2xl font-bold text-primary">Rastrea tu pedido</h1>
              <p className="text-sm text-on-surface-variant">
                Ingresa los datos que recibiste al registrar tu pedido.
              </p>
            </div>
            <form onSubmit={onBuscar} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">N° de Tracking</label>
                <div className="relative">
                  <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
                  <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ej: TRK-001234" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">N° de Orden</label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
                  <Input value={orden} onChange={(e) => setOrden(e.target.value)} placeholder="Ej: ORD-001234" className="pl-9" />
                </div>
              </div>
              <Button type="submit" size="lg" className="btn-cta w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                Buscar mi pedido
              </Button>
            </form>
            <p className="mt-5 text-center text-xs text-on-surface-variant">
              ¿No tenés tu número de tracking?{" "}
              <a href={whatsappLink(WA, "Hola, no tengo mi número de tracking")} target="_blank" rel="noopener noreferrer" className="font-medium text-whatsapp hover:underline">
                Escríbenos por WhatsApp →
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  /* ---------- Estado 2/3: resultados ---------- */
  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="rounded-full bg-surface-container px-4 py-1.5 text-sm text-on-surface-variant">
          {tracking} · {orden}
        </span>
        <Button variant="ghost" size="sm" onClick={buscarOtro}>
          <RotateCcw />
          Buscar otro
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
      <Card>
        <CardContent className="space-y-8 pt-6">
          {/* Resumen del pedido */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              Resumen del pedido
            </h2>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Dato label="Titular" valor={result.titular} />
              <Dato label="Consignatario" valor={result.consignatario} />
              <Dato label="N° Tracking" valor={tracking} fuerte />
              <Dato label="N° Orden" valor={orden} fuerte />
              <Dato
                label="Producto"
                valor={result.productos.map((p) => `${p.cantidad}× ${p.producto}`).join(", ") || "—"}
              />
              <Dato label="Comunidad" valor={result.comunidad} />
            </div>
          </section>

          {/* Estado actual: stepper */}
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              Estado actual
            </h2>
            <Stepper estados={result.estados} />
            <p className="mt-4 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-on-surface-variant">
              Tu pedido está en <strong>{result.estado_actual}</strong>. Te avisaremos al avanzar de etapa.
            </p>
          </section>

          {/* Selector de envío / confirmación */}
          <section>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              ¿Cómo querés recibir tu pedido?
            </h2>
            {confirmado ? (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-whatsapp/40 bg-whatsapp/10 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-whatsapp-dark" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">¡Tipo de envío confirmado!</p>
                  <p className="text-on-surface-variant">
                    Seleccionaste:{" "}
                    {OPCIONES_ENVIO.find((o) => o.tipo === result.tipo_envio)?.label ?? "—"}.
                    Nuestro equipo te contactará pronto por WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-on-surface-variant">
                  Seleccioná una opción — nuestro equipo coordinará con vos por WhatsApp.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {OPCIONES_ENVIO.map((o) => {
                    const Icon = o.icon;
                    const sel = seleccion === o.tipo;
                    return (
                      <button
                        key={o.tipo}
                        type="button"
                        onClick={() => setSeleccion(o.tipo)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm transition-colors ${
                          sel
                            ? "border-primary bg-secondary/60 font-medium text-primary"
                            : "border-outline-variant hover:border-primary"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        {o.label}
                        {sel && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <Button className="btn-cta mt-4 w-full" onClick={onConfirmar} disabled={confirmando}>
                  {confirmando ? <Loader2 className="animate-spin" /> : null}
                  Confirmar tipo de envío
                </Button>
                <p className="mt-2 text-center text-xs text-on-surface-muted">
                  Al confirmar, nuestro equipo te contactará por WhatsApp para coordinar.
                </p>
              </>
            )}
          </section>

          <div className="border-t border-outline-variant pt-4 text-center text-sm">
            <span className="text-on-surface-variant">¿Tenés dudas sobre tu pedido? </span>
            <a href={whatsappLink(WA, `Hola, consulto por mi pedido ${orden}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-whatsapp hover:underline">
              <MessageCircle className="h-4 w-4" />
              Escribir al asesor
            </a>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </main>
  );
}

function Dato({ label, valor, fuerte }: { label: string; valor?: string | null; fuerte?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-on-surface-muted">{label}</dt>
      <dd className={fuerte ? "font-semibold text-primary" : "text-foreground"}>{valor || "—"}</dd>
    </div>
  );
}

function Stepper({ estados }: { estados: RastreoResult["estados"] }) {
  return (
    <ol className="flex items-start gap-1 overflow-x-auto pb-1">
      {estados.map((e, i) => (
        <li key={e.nombre} className="relative flex min-w-[64px] flex-1 shrink-0 flex-col items-center text-center">
          {i > 0 && (
            <span
              className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full ${
                e.completado || e.activo ? "bg-primary" : "bg-outline-variant"
              }`}
            />
          )}
          <span
            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs ${
              e.completado
                ? "border-primary bg-primary text-primary-foreground"
                : e.activo
                ? "border-gold bg-white text-gold"
                : "border-outline-variant bg-white text-on-surface-muted"
            }`}
          >
            {e.completado ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          <span className={`mt-1.5 text-[11px] ${e.activo ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
            {e.nombre}
          </span>
        </li>
      ))}
    </ol>
  );
}
