"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";

import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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

const schema = z
  .object({
    password_actual: z.string().min(1, "Ingresa tu contraseña temporal"),
    password_nueva: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmar: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((d) => d.password_nueva === d.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type Values = z.infer<typeof schema>;

export default function CambiarPasswordPage() {
  const router = useRouter();
  const { usuario, login } = useAuth();
  const [show, setShow] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password_actual: "", password_nueva: "", confirmar: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    try {
      await api.post("/auth/cambiar-password", {
        password_actual: values.password_actual,
        password_nueva: values.password_nueva,
      });

      // Refleja que ya no requiere cambio obligatorio (cookie + store).
      if (usuario) login({ ...usuario, password_temporal: false });

      toast.success("Contraseña actualizada");
      router.replace("/admin/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo cambiar la contraseña"
      );
      form.setError("password_actual", { message });
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <KeyRound className="h-6 w-6" />
          </span>
          <CardTitle className="text-xl">Cambia tu contraseña</CardTitle>
          <CardDescription>
            Por seguridad, define una nueva contraseña antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="password_actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña temporal</FormLabel>
                    <FormControl>
                      <PasswordInput
                        show={show}
                        autoComplete="current-password"
                        placeholder="La contraseña que te asignaron"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_nueva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        show={show}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        show={show}
                        autoComplete="new-password"
                        placeholder="Repite la nueva contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {show ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              </button>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar y continuar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  { show: boolean } & React.ComponentProps<typeof Input>
>(({ show, ...props }, ref) => (
  <div className="relative">
    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted" />
    <Input
      ref={ref}
      type={show ? "text" : "password"}
      className="pl-10"
      {...props}
    />
  </div>
));
PasswordInput.displayName = "PasswordInput";
