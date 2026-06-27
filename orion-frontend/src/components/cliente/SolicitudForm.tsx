"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

import { crearSolicitudPublica } from "@/lib/services/solicitudes";
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

const schema = z
  .object({
    titular: z.string().min(1, "Tu nombre es obligatorio"),
    codigoComunidad: z.string(),
    sinComunidad: z.boolean(),
    consignatario: z.string(),
    firma: z.string().min(1, "La firma es obligatoria"),
    num_orden: z.string().min(1, "El número de orden es obligatorio"),
    num_tracking: z.string().min(1, "El tracking es obligatorio"),
    whatsapp: z.string().min(1, "El WhatsApp es obligatorio"),
    valor_usd: z
      .string()
      .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Monto inválido"),
    productos: z.array(productoSchema),
  })
  .superRefine((val, ctx) => {
    if (!val.sinComunidad && val.codigoComunidad.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["codigoComunidad"],
        message: "Ingresá el código de tu comunidad",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  titular: "",
  codigoComunidad: "",
  sinComunidad: false,
  consignatario: "",
  firma: "",
  num_orden: "",
  num_tracking: "",
  whatsapp: "",
  valor_usd: "",
  productos: [{ cantidad: "1", producto: "", marca: "" }],
};

export function SolicitudForm() {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [enviado, setEnviado] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const { isSubmitting } = form.formState;
  const sinComunidad = form.watch("sinComunidad");

  async function handleSubmit(values: FormValues) {
    const input: SolicitudInput = {
      titular: values.titular.trim(),
      sin_comunidad: values.sinComunidad,
      codigo_comunidad: values.sinComunidad
        ? undefined
        : values.codigoComunidad.trim() || undefined,
      consignatario: values.consignatario.trim() || undefined,
      firma: values.firma.trim(),
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
            <TextField control={form.control} name="whatsapp" label="WhatsApp *" placeholder="+51999999999" type="tel" />
            <TextField control={form.control} name="consignatario" label="Consignatario" placeholder="Opcional" />
            <TextField control={form.control} name="firma" label="Firma *" placeholder="Apellido de quien recibe en EE.UU." />

            <div className="space-y-2 sm:col-span-2">
              <FormField
                control={form.control}
                name="codigoComunidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de comunidad *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={sinComunidad}
                        placeholder="Te lo comparte tu comunidad"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sinComunidad"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-outline-variant text-primary focus-visible:ring-primary"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        if (e.target.checked) {
                          form.clearErrors("codigoComunidad");
                          form.setValue("codigoComunidad", "");
                        }
                      }}
                    />
                    No pertenezco a ninguna comunidad
                  </label>
                )}
              />
            </div>
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
          <CardHeader>
            <CardTitle className="text-base">Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <div className="w-20 shrink-0">
                <TextField control={form.control} name="productos.0.cantidad" label="Cant." type="number" />
              </div>
              <div className="flex-1">
                <TextField control={form.control} name="productos.0.producto" label="Producto" placeholder="Descripción" />
              </div>
              <div className="flex-1">
                <TextField control={form.control} name="productos.0.marca" label="Marca" placeholder="Opcional" />
              </div>
            </div>
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
