"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calculator, Loader2, ArrowRight, MessageCircle, RotateCcw } from "lucide-react";

import { calcularCotizacion } from "@/lib/services/cotizador";
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valor_usd: "", peso_kg: "" },
  });
  const { isSubmitting } = form.formState;

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
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Calculator className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-primary">Cotizá tu envío</h1>
        <p className="text-sm text-on-surface-variant">
          Estimá el costo de importación según el valor y el peso de tu compra.
        </p>
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
                      <FormLabel>Valor de la compra (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peso_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso aproximado (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ej: 1.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                  Calcular
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: resultado con desglose */}
      {result?.aplica_calculo === true && (
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
      )}

      {/* Paso 3: invitación al asesor */}
      {result?.aplica_calculo === false && (
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
