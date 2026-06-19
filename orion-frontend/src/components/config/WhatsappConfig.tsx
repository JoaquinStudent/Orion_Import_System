"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, MessageCircle, Info } from "lucide-react";

import { obtenerConfigPublica, actualizarConfigGeneral } from "@/lib/services/config";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WhatsappConfig() {
  const [numero, setNumero] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    obtenerConfigPublica()
      .then((c) => {
        setNumero(c.whatsapp_atencion);
        setOriginal(c.whatsapp_atencion);
      })
      .catch((e) => toast.error(getApiErrorMessage(e, "No se pudo cargar la configuración")))
      .finally(() => setLoading(false));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!numero.trim()) {
      toast.error("Ingresá un número");
      return;
    }
    setSaving(true);
    try {
      const c = await actualizarConfigGeneral({ whatsapp_atencion: numero.trim() });
      setOriginal(c.whatsapp_atencion);
      toast.success("Número actualizado");
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
          <MessageCircle className="h-4 w-4 text-whatsapp" />
          N° de WhatsApp de atención al cliente
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
              Este número aparece visible en la app pública para que tus clientes te contacten.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Número telefónico</label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="+51 999 999 999" />
              </div>
              <Button type="submit" disabled={saving || numero.trim() === original}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                Guardar número
              </Button>
            </div>
            <p className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Aparece en: Landing page · Cotizador · Rastreador de pedidos
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
