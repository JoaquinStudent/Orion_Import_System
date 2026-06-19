"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Calculator,
  Loader2,
  ArrowRight,
  ArrowUp,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  calcularCotizacion,
  obtenerConfigCotizador,
  obtenerTipoCambio,
} from "@/lib/services/cotizador";
import { getApiErrorMessage } from "@/lib/api";
import { formatUSD, whatsappLink } from "@/lib/format";
import type { CotizacionResult } from "@/types/cotizador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  valor_usd: z
    .string()
    .min(1, "Ingresá el valor")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Debe ser mayor a 0"),
  peso_kg: z
    .string()
    .min(1, "Ingresá el peso")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Debe ser mayor a 0"),
});

type FormValues = z.infer<typeof schema>;

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export default function CotizarPage() {
  const [result, setResult] = useState<CotizacionResult | null>(null);
  const [tipoCambio, setTipoCambio] = useState<number | null>(null);
  const [umbral, setUmbral] = useState(200);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valor_usd: "", peso_kg: "" },
  });
  const { isSubmitting } = form.formState;

  // Tipo de cambio en vivo + umbral del asesor (para el hint dinámico).
  useEffect(() => {
    obtenerTipoCambio().then((tc) => setTipoCambio(tc.usd_pen)).catch(() => {});
    obtenerConfigCotizador().then((c) => setUmbral(c.umbral_asesor)).catch(() => {});
  }, []);

  const valorNum = Number(form.watch("valor_usd"));
  const pesoNum = Number(form.watch("peso_kg"));
  const valorValido = form.watch("valor_usd") !== "" && !isNaN(valorNum) && valorNum > 0;
  const pesoValido = form.watch("peso_kg") !== "" && !isNaN(pesoNum) && pesoNum > 0;

  async function onSubmit(values: FormValues) {
    try {
      setResult(
        await calcularCotizacion({
          valor_usd: Number(values.valor_usd),
          peso_kg: Number(values.peso_kg),
        })
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo calcular la cotización"));
    }
  }

  function reiniciar() {
    setResult(null);
    form.reset();
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Calculator className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-primary">Cotizá tu próximo envío</h1>
        <p className="text-sm text-on-surface-variant">
          Ingresá los datos de tu producto y calculá el costo al instante.
        </p>
        {tipoCambio !== null && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
            Dólar: {penFormatter.format(tipoCambio)} · en vivo
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}
      </div>

      {/* Paso 1: formulario */}
      {result === null && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <FormField
                  control={form.control}
                  name="valor_usd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor del producto (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 120" {...field} />
                      </FormControl>
                      <FormMessage />
                      {valorValido &&
                        (valorNum > umbral ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Mayor a ${umbral} · te derivamos a un asesor
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Menor a ${umbral} · aplica tarifa de embarque
                          </p>
                        ))}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peso_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso del producto (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ej: 1.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview del redondeo de peso */}
                {pesoValido && (
                  <div className="rounded-lg bg-surface-container px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-on-surface-variant">
                        Peso ingresado: <strong className="text-foreground">{pesoNum} kg</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Peso a cobrar: {Math.ceil(pesoNum)} kg
                        <ArrowUp className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-muted">
                      Siempre se redondea al siguiente kilogramo entero.
                    </p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                  Calcular costo de envío
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: resultado con desglose */}
      {result?.aplica_calculo === true && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tu cotización estimada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Linea label="Valor declarado" valor={formatUSD(result.valor_usd)} />
            <Linea label="Peso real" valor={`${result.peso_real_kg} kg`} />
            <Linea label="Peso cobrado (redondeado)" valor={`${result.peso_cobrado_kg} kg`} />
            <Linea label="Flete" valor={formatUSD(result.flete_usd)} />
            <Linea label="Desaduanaje" valor={formatUSD(result.desaduanaje_usd)} />
            <div className="my-2 border-t border-outline-variant" />
            <Linea label="Total" valor={formatUSD(result.total_usd)} fuerte />
            <Linea
              label={`Total en soles (TC ${result.tipo_cambio})`}
              valor={penFormatter.format(result.total_pen)}
              fuerte
            />
            <p className="pt-2 text-xs text-on-surface-muted">
              * Estimación referencial. El costo final puede variar según la verificación del paquete.
            </p>
            <Button variant="outline" className="w-full" onClick={reiniciar}>
              <RotateCcw />
              Nueva cotización
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Paso 3: invitación al asesor */}
      {result?.aplica_calculo === false && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <MessageCircle className="h-6 w-6" />
            </span>
            <p className="text-on-surface-variant">{result.mensaje}</p>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={whatsappLink(
                  result.whatsapp_atencion,
                  "Hola, quiero cotizar una importación de más de $200."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle />
                Hablar con un asesor
              </a>
            </Button>
            <Button variant="ghost" onClick={reiniciar}>
              <RotateCcw />
              Volver a cotizar
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      )}
    </main>
  );
}

function Linea({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={fuerte ? "font-semibold text-foreground" : "text-on-surface-variant"}>
        {label}
      </span>
      <span className={fuerte ? "text-lg font-bold text-primary" : "text-foreground"}>
        {valor}
      </span>
    </div>
  );
}
