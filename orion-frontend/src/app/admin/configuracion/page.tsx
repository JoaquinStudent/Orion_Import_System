"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock, MapPin } from "lucide-react";

import {
  listarComunidades,
  crearComunidad,
  actualizarComunidad,
  eliminarComunidad,
} from "@/lib/services/comunidades";
import { getApiErrorMessage } from "@/lib/api";
import { puedeEditar } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { Comunidad } from "@/types/comunidad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuariosAdmin } from "@/components/usuarios/UsuariosAdmin";
import { WhatsappConfig } from "@/components/config/WhatsappConfig";

export default function ConfiguracionPage() {
  const { usuario, loading: authLoading } = useAuth();
  const permitido = puedeEditar(usuario, "configuracion");

  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");

  const fetchComunidades = useCallback(async () => {
    setLoading(true);
    try {
      setComunidades(await listarComunidades());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar las comunidades"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && permitido) fetchComunidades();
  }, [authLoading, permitido, fetchComunidades]);

  function resetForm() {
    setEditingId(null);
    setNombre("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("Ingresá un nombre");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await actualizarComunidad(editingId, { nombre: nombre.trim() });
        toast.success("Comunidad actualizada");
      } else {
        await crearComunidad({ nombre: nombre.trim() });
        toast.success("Comunidad creada");
      }
      resetForm();
      await fetchComunidades();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c: Comunidad) {
    if (!window.confirm(`¿Eliminar la comunidad "${c.nombre}"?`)) return;
    try {
      await eliminarComunidad(c.id);
      toast.success("Comunidad eliminada");
      if (editingId === c.id) resetForm();
      await fetchComunidades();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo eliminar"));
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
        <p>No tenés permiso para la configuración.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Configuración</h1>
        <p className="text-sm text-on-surface-variant">
          Gestioná el acceso del equipo, el WhatsApp de atención y las comunidades.
        </p>
      </div>

      {/* Usuarios del sistema */}
      <UsuariosAdmin />

      {/* WhatsApp de atención */}
      <WhatsappConfig />

      {/* Comunidades */}
      <div>
        <h2 className="mb-1 text-base font-semibold text-foreground">Comunidades</h2>
        <p className="mb-3 text-sm text-on-surface-variant">
          Catálogo que se usa al registrar un pedido.
        </p>
      </div>

      {/* Form crear / editar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Editar comunidad" : "Nueva comunidad"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Comunidad Norte"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : editingId ? <Save /> : <Plus />}
                {editingId ? "Guardar" : "Agregar"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comunidades.length === 0 ? (
            <p className="py-12 text-center text-sm text-on-surface-muted">
              Todavía no hay comunidades.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {comunidades.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <MapPin className="h-4 w-4 shrink-0 text-on-surface-muted" />
                  <span className="flex-1 font-medium text-foreground">{c.nombre}</span>
                  <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditingId(c.id); setNombre(c.nombre); }}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => onDelete(c)}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
