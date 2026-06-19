"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, Save, X, Lock, MapPin } from "lucide-react";

import {
  listarComunidades,
  crearComunidad,
  actualizarComunidad,
  eliminarComunidad,
} from "@/lib/services/comunidades";
import { puedeEditar } from "@/lib/permisos";
import { useAuth } from "@/hooks/useAuth";
import type { Comunidad } from "@/types/comunidad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuariosAdmin } from "@/components/usuarios/UsuariosAdmin";
import { WhatsappConfig } from "@/components/config/WhatsappConfig";
import { ArchivoConfig } from "@/components/config/ArchivoConfig";

export default function ConfiguracionPage() {
  const { usuario, loading: authLoading } = useAuth();
  const permitido = puedeEditar(usuario, "configuracion");
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");

  const comunidadesQ = useQuery({
    queryKey: ["comunidades"],
    queryFn: listarComunidades,
    enabled: !authLoading && permitido,
  });
  const comunidades: Comunidad[] = comunidadesQ.data ?? [];
  const loading = comunidadesQ.isLoading;

  function resetForm() {
    setEditingId(null);
    setNombre("");
  }

  const guardarMut = useMutation({
    mutationFn: (nombre: string) =>
      editingId ? actualizarComunidad(editingId, { nombre }) : crearComunidad({ nombre }),
    onSuccess: () => {
      toast.success(editingId ? "Comunidad actualizada" : "Comunidad creada");
      queryClient.invalidateQueries({ queryKey: ["comunidades"] });
      resetForm();
    },
  });
  const saving = guardarMut.isPending;

  const eliminarMut = useMutation({
    mutationFn: (id: number) => eliminarComunidad(id),
    onSuccess: () => {
      toast.success("Comunidad eliminada");
      queryClient.invalidateQueries({ queryKey: ["comunidades"] });
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("Ingresá un nombre");
      return;
    }
    guardarMut.mutate(nombre.trim());
  }

  function onDelete(c: Comunidad) {
    if (!window.confirm(`¿Eliminar la comunidad "${c.nombre}"?`)) return;
    eliminarMut.mutate(c.id, {
      onSuccess: () => {
        if (editingId === c.id) resetForm();
      },
    });
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

      {/* Archivado de entregados */}
      <ArchivoConfig />

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
