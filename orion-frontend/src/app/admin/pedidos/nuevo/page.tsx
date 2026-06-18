"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Plus, Trash2, Loader2, Save } from "lucide-react";

import { crearPedido } from "@/lib/services/pedidos";
import { listarEstados } from "@/lib/services/estados";
import { getApiErrorMessage } from "@/lib/api";
import { TIPO_ENVIO_LABEL } from "@/lib/constants";
import type { Estado } from "@/types/estado";
import type { PedidoInput } from "@/types/pedido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productoSchema = z.object({
  cantidad: z
    .string()
    .min(1, "Req.")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, "Mín. 1"),
  producto: z.string().min(1, "Requerido"),
  marca: z.string(),
});

const schema = z.object({
  titular: z.string().min(1, "El titular es obligatorio"),
  comunidad: z.string(),
  consignatario: z.string(),
  firma: z.string(),
  num_orden: z.string().min(1, "El número de orden es obligatorio"),
  num_tracking: z.string().min(1, "El tracking es obligatorio"),
  whatsapp: z.string().min(1, "El WhatsApp es obligatorio"),
  valor_usd: z
    .string()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Monto inválido"),
  costo_importacion_usd: z
    .string()
    .min(1, "Obligatorio")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Debe ser mayor a 0"),
  tipo_envio: z.enum(["", "almacen", "lima", "shalom"]),
  estado_id: z.string(),
  productos: z.array(productoSchema),
});

type FormValues = z.infer<typeof schema>;

const TIPOS = ["almacen", "lima", "shalom"] as const;

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [estados, setEstados] = useState<Estado[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titular: "",
      comunidad: "",
      consignatario: "",
      firma: "",
      num_orden: "",
      num_tracking: "",
      whatsapp: "",
      valor_usd: "",
      costo_importacion_usd: "",
      tipo_envio: "",
      estado_id: "",
      productos: [{ cantidad: "1", producto: "", marca: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productos",
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    listarEstados()
      .then((e) => {
        setEstados(e);
        if (e.length && !form.getValues("estado_id")) {
          form.setValue("estado_id", String(e[0].id));
        }
      })
      .catch(() => {
        /* sin estados, el back asignará el de menor orden por defecto */
      });
  }, [form]);

  async function onSubmit(values: FormValues) {
    const input: PedidoInput = {
      titular: values.titular.trim(),
      comunidad: values.comunidad.trim() || undefined,
      consignatario: values.consignatario.trim() || undefined,
      firma: values.firma.trim() || undefined,
      num_orden: values.num_orden.trim(),
      num_tracking: values.num_tracking.trim(),
      whatsapp: values.whatsapp.trim(),
      valor_usd: values.valor_usd ? Number(values.valor_usd) : 0,
      costo_importacion_usd: Number(values.costo_importacion_usd),
      tipo_envio: values.tipo_envio || null,
      estado_id: values.estado_id ? Number(values.estado_id) : undefined,
      productos: values.productos.map((p) => ({
        cantidad: Number(p.cantidad),
        producto: p.producto.trim(),
        marca: p.marca.trim() || undefined,
      })),
    };

    try {
      const creado = await crearPedido(input);
      toast.success(`Pedido ${creado.num_orden} creado`);
      router.push("/admin/pedidos");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === "DUPLICADO"
      ) {
        const msg = "Ese número de orden o tracking ya existe";
        form.setError("num_orden", { message: msg });
        form.setError("num_tracking", { message: msg });
        toast.error(msg);
        return;
      }
      toast.error(getApiErrorMessage(error, "No se pudo crear el pedido"));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/pedidos" aria-label="Volver">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Nuevo pedido</h1>
          <p className="text-sm text-on-surface-variant">
            Registrá una importación y sus productos.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Datos del titular */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="titular" label="Titular *" placeholder="Nombre del titular" />
              <TextField control={form.control} name="comunidad" label="Comunidad" placeholder="Comunidad (opcional)" />
              <TextField control={form.control} name="consignatario" label="Consignatario" placeholder="Quien recibe (opcional)" />
              <TextField control={form.control} name="firma" label="Firma" placeholder="Firma (opcional)" />
              <TextField control={form.control} name="whatsapp" label="WhatsApp *" placeholder="+51999999999" type="tel" />
            </CardContent>
          </Card>

          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identificación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="num_orden" label="N° de orden *" placeholder="ORD-001234" />
              <TextField control={form.control} name="num_tracking" label="N° de tracking *" placeholder="TRK-001234" />
            </CardContent>
          </Card>

          {/* Importación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Importación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="valor_usd" label="Valor (USD)" placeholder="0.00" type="number" />
              <TextField
                control={form.control}
                name="costo_importacion_usd"
                label="Costo de importación (USD) *"
                placeholder="0.00"
                type="number"
              />

              <FormField
                control={form.control}
                name="tipo_envio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de envío</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>
                        <option value="">Sin asignar</option>
                        {TIPOS.map((t) => (
                          <option key={t} value={t}>
                            {TIPO_ENVIO_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado inicial</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>
                        {estados.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Productos */}
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
              {fields.length === 0 && (
                <p className="text-sm text-on-surface-muted">
                  Sin productos. Podés agregar uno o dejar el pedido sin detalle.
                </p>
              )}
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-start gap-2">
                  <div className="w-20 shrink-0">
                    <TextField
                      control={form.control}
                      name={`productos.${i}.cantidad`}
                      label={i === 0 ? "Cant." : ""}
                      type="number"
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      control={form.control}
                      name={`productos.${i}.producto`}
                      label={i === 0 ? "Producto" : ""}
                      placeholder="Descripción"
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      control={form.control}
                      name={`productos.${i}.marca`}
                      label={i === 0 ? "Marca" : ""}
                      placeholder="Opcional"
                    />
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

          <div className="flex justify-end gap-3">
            <Button asChild variant="outline" type="button">
              <Link href="/admin/pedidos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              Guardar pedido
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const selectClass =
  "h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

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
