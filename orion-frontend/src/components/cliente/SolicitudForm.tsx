"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { Plus, Trash2, Loader2, Send, CheckCircle2 } from "lucide-react";

import { crearSolicitudPublica, listarComunidadesPublicas } from "@/lib/services/solicitudes";
import { getApiErrorMessage } from "@/lib/api";
import type { SolicitudInput } from "@/types/solicitud";
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
import { Turnstile } from "@/components/cliente/Turnstile";

const productoSchema = z.object({
  cantidad: z
    .string()
    .min(1, "Req.")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, "Mín. 1"),
  producto: z.string().min(1, "Requerido"),
  marca: z.string(),
});

const schema = z.object({
  titular: z.string().min(1, "Tu nombre es obligatorio"),
  comunidad: z.string().min(1, "Elegí tu comunidad"),
  consignatario: z.string(),
  firma: z.string(),
  num_orden: z.string().min(1, "El número de orden es obligatorio"),
  num_tracking: z.string().min(1, "El tracking es obligatorio"),
  whatsapp: z.string().min(1, "El WhatsApp es obligatorio"),
  valor_usd: z
    .string()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Monto inválido"),
  productos: z.array(productoSchema),
});

type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

const DEFAULTS: FormValues = {
  titular: "",
  comunidad: "",
  consignatario: "",
  firma: "",
  num_orden: "",
  num_tracking: "",
  whatsapp: "",
  valor_usd: "",
  productos: [{ cantidad: "1", producto: "", marca: "" }],
};

export function SolicitudForm() {
  const [comunidades, setComunidades] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [enviado, setEnviado] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productos",
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    listarComunidadesPublicas().then(setComunidades).catch(() => {});
  }, []);

  async function handleSubmit(values: FormValues) {
    const input: SolicitudInput = {
      titular: values.titular.trim(),
      comunidad: values.comunidad.trim(),
      consignatario: values.consignatario.trim() || undefined,
      firma: values.firma.trim() || undefined,
      num_orden: values.num_orden.trim(),
      num_tracking: values.num_tracking.trim(),
      whatsapp: values.whatsapp.trim(),
      valor_usd: values.valor_usd ? Number(values.valor_usd) : 0,
      productos: values.productos.map((p) => ({
        cantidad: Number(p.cantidad),
        producto: p.producto.trim(),
        marca: p.marca.trim() || undefined,
      })),
      turnstile_token: turnstileToken || undefined,
    };

    try {
      await crearSolicitudPublica(input);
      setEnviado(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.code === "DUPLICADO") {
        const msg = "Ese número de orden o tracking ya fue registrado";
        form.setError("num_orden", { message: msg });
        form.setError("num_tracking", { message: msg });
        toast.error(msg);
        return;
      }
      toast.error(getApiErrorMessage(error, "No se pudo enviar tu solicitud"));
    }
  }

  if (enviado) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h2 className="text-xl font-semibold">¡Solicitud recibida!</h2>
          <p className="text-on-surface-variant">
            La revisaremos antes de procesarla. Te contactaremos por WhatsApp si necesitamos
            algún dato.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
            <Button
              onClick={() => {
                form.reset(DEFAULTS);
                setEnviado(false);
              }}
            >
              Registrar otro pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tus datos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="titular" label="Nombre completo *" placeholder="Tu nombre" />
            <FormField
              control={form.control}
              name="comunidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comunidad *</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClass}>
                      <option value="">Elegí tu comunidad</option>
                      {comunidades.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField control={form.control} name="whatsapp" label="WhatsApp *" placeholder="+51999999999" type="tel" />
            <TextField control={form.control} name="consignatario" label="Quién recibe" placeholder="Opcional" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de la compra</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="num_orden" label="N° de orden *" placeholder="ORD-001234" />
            <TextField control={form.control} name="num_tracking" label="N° de tracking *" placeholder="TRK-001234" />
            <TextField control={form.control} name="valor_usd" label="Valor declarado (USD)" placeholder="0.00" type="number" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Productos</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ cantidad: "1", producto: "", marca: "" })}
            >
              <Plus />
              Agregar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} className="flex items-start gap-2">
                <div className="w-20 shrink-0">
                  <TextField control={form.control} name={`productos.${i}.cantidad`} label={i === 0 ? "Cant." : ""} type="number" />
                </div>
                <div className="flex-1">
                  <TextField control={form.control} name={`productos.${i}.producto`} label={i === 0 ? "Producto" : ""} placeholder="Descripción" />
                </div>
                <div className="flex-1">
                  <TextField control={form.control} name={`productos.${i}.marca`} label={i === 0 ? "Marca" : ""} placeholder="Opcional" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={i === 0 ? "mt-8" : ""}
                  aria-label="Quitar producto"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Turnstile onToken={setTurnstileToken} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            Enviar solicitud
          </Button>
        </div>
      </form>
    </Form>
  );
}

/** Campo de texto reutilizable atado a react-hook-form. */
function TextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              type={type}
              step={type === "number" ? "0.01" : undefined}
              placeholder={placeholder}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
