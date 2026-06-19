"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Lock, RotateCcw, Info, CheckCircle2, MessageCircle } from "lucide-react";

import { obtenerConfigCotizador, actualizarConfigCotizador } from "@/lib/services/cotizador";
import { formatUSD } from "@/lib/format";
import { puedeEditar } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { CotizadorConfig } from "@/types/cotizador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CotizadorConfigPage() {
  const { usuario, loading: authLoading } = useAuth();
  const permitido = puedeEditar(usuario, "cotizador");
  const queryClient = useQueryClient();

  const [flete, setFlete] = useState("");
  const [desaduanaje, setDesaduanaje] = useState("");

  const configQ = useQuery({
    queryKey: ["cotizador-config"],
    queryFn: obtenerConfigCotizador,
    enabled: !authLoading && permitido,
  });
  const config: CotizadorConfig | null = configQ.data ?? null;
  const loading = configQ.isLoading;

  // Sembrar los inputs con los valores del backend cuando llegan.
  useEffect(() => {
    if (configQ.data) {
      setFlete(String(configQ.data.flete_por_kilo));
      setDesaduanaje(String(configQ.data.desaduanaje));
    }
  }, [configQ.data]);

  const guardarMut = useMutation({
    mutationFn: () =>
      actualizarConfigCotizador({
        flete_por_kilo: Number(flete),
        desaduanaje: Number(desaduanaje),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotizador-config"] });
      toast.success("Configuración actualizada");
    },
  });
  const saving = guardarMut.isPending;

  const fleteNum = Number(flete) || 0;
  const desadNum = Number(desaduanaje) || 0;
  const fleteEjemplo = fleteNum * 2; // ejemplo: producto de 1.5 kg → cobra 2 kg
  const totalEjemplo = fleteEjemplo + desadNum;

  const sinCambios =
    config !== null &&
    Number(flete) === config.flete_por_kilo &&
    Number(desaduanaje) === config.desaduanaje;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(Number(flete)) || Number(flete) < 0 || isNaN(Number(desaduanaje)) || Number(desaduanaje) < 0) {
      toast.error("Ingresá montos válidos (≥ 0)");
      return;
    }
    guardarMut.mutate();
  }

  function restaurar() {
    if (!config) return;
    setFlete(String(config.flete_por_kilo));
    setDesaduanaje(String(config.desaduanaje));
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!permitido) {
    return (
      <div className="mx-auto max-w-md py-24 text-center text-on-surface-muted">
        <Lock className="mx-auto mb-3 h-10 w-10 opacity-60" />
        <p>No tenés permiso para editar el cotizador.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Configuración del cotizador</h1>
        <p className="text-sm text-on-surface-variant">
          Definí los valores que usa para calcular el costo de envío.
        </p>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
        <Info className="h-4 w-4 shrink-0" />
        Los cambios se reflejan inmediatamente en el cotizador público.
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tarifas + vista previa */}
          <form onSubmit={onSubmit} className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tarifas de envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Flete por kilogramo (USD)</label>
                  <Input type="number" step="0.01" min={0} value={flete} onChange={(e) => setFlete(e.target.value)} />
                  <p className="text-xs text-on-surface-muted">
                    Ejemplo: un producto de 1.5 kg cobra 2 kg → {formatUSD(fleteEjemplo)} de flete.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Desaduanaje (USD)</label>
                  <Input type="number" step="0.01" min={0} value={desaduanaje} onChange={(e) => setDesaduanaje(e.target.value)} />
                  <p className="text-xs text-on-surface-muted">
                    Costo fijo que se cobra una sola vez por importación.
                  </p>
                </div>

                {/* Vista previa */}
                <div className="rounded-lg bg-surface-container p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
                    Vista previa (producto de 1.5 kg)
                  </p>
                  <div className="space-y-1 text-sm">
                    <Linea label="Peso cobrado" valor="2 kg" />
                    <Linea label={`Flete (2 × ${formatUSD(fleteNum)})`} valor={formatUSD(fleteEjemplo)} />
                    <Linea label="Desaduanaje" valor={formatUSD(desadNum)} />
                    <div className="my-1 border-t border-outline-variant" />
                    <Linea label="Total USD" valor={formatUSD(totalEjemplo)} fuerte />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={restaurar} disabled={sinCambios || saving}>
                <RotateCcw />
                Restaurar valores
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={sinCambios || saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                Guardar cambios
              </Button>
            </div>
          </form>

          {/* Explicador */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">¿Cómo funciona el cotizador?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-on-surface-variant">
                  <strong className="text-foreground">Menor a {config ? formatUSD(config.umbral_asesor) : "$200"}:</strong>{" "}
                  calcula el costo automáticamente (flete + desaduanaje).
                </p>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-on-surface-variant">
                  <strong className="text-foreground">Mayor al umbral:</strong> deriva al cliente a un asesor por WhatsApp (carga especial).
                </p>
              </div>
              {config && (
                <p className="rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
                  WhatsApp de atención: {config.whatsapp_atencion}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Linea({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface-variant">{label}</span>
      <span className={fuerte ? "text-base font-bold text-primary" : "text-foreground"}>{valor}</span>
    </div>
  );
}
