"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Lock } from "lucide-react";

import { obtenerConfigCotizador, actualizarConfigCotizador } from "@/lib/services/cotizador";
import { getApiErrorMessage } from "@/lib/api";
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

  const [config, setConfig] = useState<CotizadorConfig | null>(null);
  const [flete, setFlete] = useState("");
  const [desaduanaje, setDesaduanaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const c = await obtenerConfigCotizador();
      setConfig(c);
      setFlete(String(c.flete_por_kilo));
      setDesaduanaje(String(c.desaduanaje));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo cargar la configuración"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && permitido) fetchConfig();
  }, [authLoading, permitido, fetchConfig]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(Number(flete)) || Number(flete) < 0 || isNaN(Number(desaduanaje)) || Number(desaduanaje) < 0) {
      toast.error("Ingresá montos válidos (≥ 0)");
      return;
    }
    setSaving(true);
    try {
      const actualizado = await actualizarConfigCotizador({
        flete_por_kilo: Number(flete),
        desaduanaje: Number(desaduanaje),
      });
      setConfig(actualizado);
      toast.success("Configuración actualizada");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar"));
    } finally {
      setSaving(false);
    }
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
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Configuración del cotizador</h1>
        <p className="text-sm text-on-surface-variant">
          Tarifas que usa el cotizador público para estimar el costo de envío.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarifas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Flete por kilo (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={flete}
                  onChange={(e) => setFlete(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Desaduanaje (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={desaduanaje}
                  onChange={(e) => setDesaduanaje(e.target.value)}
                />
              </div>

              {config && (
                <p className="rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
                  Umbral para derivar a un asesor: {formatUSD(config.umbral_asesor)} ·
                  WhatsApp de atención: {config.whatsapp_atencion}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}
                  Guardar cambios
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
