"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Archive } from "lucide-react";

import { obtenerConfigPublica, actualizarConfigGeneral } from "@/lib/services/config";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_DIAS = 7;

export function ArchivoConfig() {
  const [dias, setDias] = useState(String(DEFAULT_DIAS));
  const [original, setOriginal] = useState(String(DEFAULT_DIAS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    obtenerConfigPublica()
      .then((c) => {
        const v = String(c.dias_archivo_entregados ?? DEFAULT_DIAS);
        setDias(v);
        setOriginal(v);
      })
      .catch((e) => toast.error(getApiErrorMessage(e, "No se pudo cargar la configuración")))
      .finally(() => setLoading(false));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(dias);
    if (!dias || isNaN(n) || n < 1) {
      toast.error("Ingresá un número de días válido (mínimo 1)");
      return;
    }
    setSaving(true);
    try {
      const c = await actualizarConfigGeneral({ dias_archivo_entregados: n });
      const v = String(c.dias_archivo_entregados ?? n);
      setOriginal(v);
      setDias(v);
      toast.success("Configuración actualizada");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo guardar"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Archive className="h-4 w-4 text-primary" />
          Archivado de pedidos entregados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={guardar} className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Tras estos días de entregado, el pedido se archiva y deja de mostrarse en el
              tablero (no se borra; podés verlo con &quot;Ver archivados&quot;).
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Días para archivar</label>
                <Input
                  type="number"
                  min={1}
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  placeholder="7"
                />
              </div>
              <Button type="submit" disabled={saving || dias === original}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                Guardar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
