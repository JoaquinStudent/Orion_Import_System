"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Package,
  Clock,
  Warehouse,
} from "lucide-react";

import { api, getApiErrorMessage } from "@/lib/api";
import { setToken, setUsuario } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse } from "@/types/usuario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof loginSchema>;

const STATS = [
  { icon: Package, valor: "+1000", label: "Órdenes/mes" },
  { icon: Clock, valor: "6-12", label: "Días de entrega" },
  { icon: Warehouse, valor: "3", label: "Almacenes" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    try {
      const { data } = await api.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        values
      );
      setToken(data.data.token);
      setUsuario(data.data.usuario);
      toast.success(`Bienvenido, ${data.data.usuario.nombre.split(" ")[0]}`);

      if (data.data.usuario.password_temporal) {
        router.replace("/admin/cambiar-password");
      } else {
        router.replace("/admin/dashboard");
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "No se pudo iniciar sesión");
      form.setError("email", { message: " " });
      form.setError("password", { message });
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panel izquierdo: marca + stats */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-navy p-12 text-white md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="z-10 max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo-white.svg"
              alt="Orión Logistic"
              width={260}
              height={177}
              className="h-44 w-auto"
              priority
            />
          </div>
          <p className="mb-12 leading-relaxed text-navy-soft">
            Gestión logística integral y seguimiento de paquetes a nivel
            nacional. Conectando negocios con soluciones eficientes y seguras.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center">
                  <Icon className="mb-1 h-6 w-6 text-gold-soft" />
                  <span className="text-2xl font-bold">{s.valor}</span>
                  <span className="text-[11px] uppercase tracking-wider text-navy-soft">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex w-full items-center justify-center bg-surface-container-low p-6 md:w-1/2">
        <div className="w-full max-w-[400px] rounded-xl border border-outline-variant bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {/* Marca móvil */}
          <div className="mb-8 flex justify-center md:hidden">
            <Image
              src="/logo.svg"
              alt="Orión Logistic"
              width={150}
              height={102}
              className="h-24 w-auto"
            />
          </div>

          <div className="mb-8 text-center">
            <h2 className="mb-1 text-2xl font-bold text-foreground">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-on-surface-variant">
              Ingresa tus credenciales para acceder al panel de administración.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">
                      Correo electrónico
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted" />
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="ejemplo@orionlogistic.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between text-primary">
                      Contraseña
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            "Contacta a un administrador para restablecer tu contraseña."
                          )
                        }
                        className="text-xs font-normal text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted transition-colors hover:text-primary"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ingresando…
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container p-3 text-center text-xs text-on-surface-variant">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Acceso seguro y encriptado. Uso exclusivo para administradores de
              Orión Logistic.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
