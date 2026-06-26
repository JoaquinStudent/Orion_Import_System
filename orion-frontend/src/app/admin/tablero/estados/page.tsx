"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";

import {
  listarEstados,
  crearEstado,
  actualizarEstado,
  eliminarEstado,
} from "@/lib/services/estados";
import type { Estado, EstadoInput } from "@/types/estado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLOR_DEFAULT = "#1B2A5E";

export default function EstadosPage() {
  const queryClient = useQueryClient();
  const estadosQ = useQuery({ queryKey: ["estados"], queryFn: listarEstados });
  const estados: Estado[] = estadosQ.data ?? [];
  const loading = estadosQ.isLoading;

  // Formulario (sirve para crear y para editar según editingId).
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState("");
  const [color, setColor] = useState(COLOR_DEFAULT);

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ["estados"] });
    queryClient.invalidateQueries({ queryKey: ["tablero"] });
  }

  function resetForm() {
    setEditingId(null);
    setNombre("");
    setOrden("");
    setColor(COLOR_DEFAULT);
  }

  function startEdit(estado: Estado) {
    setEditingId(estado.id);
    setNombre(estado.nombre);
    setOrden(String(estado.orden));
    setColor(estado.color);
  }

  const guardarMut = useMutation({
    mutationFn: (input: EstadoInput) =>
      editingId ? actualizarEstado(editingId, input) : crearEstado(input),
    onSuccess: () => {
      toast.success(editingId ? "Estado actualizado" : "Estado creado");
      invalidar();
      resetForm();
    },
  });
  const saving = guardarMut.isPending;

  const eliminarMut = useMutation({
    mutationFn: (id: number) => eliminarEstado(id),
    onSuccess: () => {
      toast.success("Estado eliminado");
      invalidar();
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    guardarMut.mutate({
      nombre: nombre.trim(),
      orden: orden ? Number(orden) : estados.length + 1,
      color,
    });
  }

  function onDelete(estado: Estado) {
    if (!window.confirm(`¿Eliminar el estado "${estado.nombre}"?`)) return;
    eliminarMut.mutate(estado.id, {
      onSuccess: () => {
        if (editingId === estado.id) resetForm();
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/tablero" aria-label="Volver al tablero">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Estados del tablero</h1>
          <p className="text-sm text-on-surface-variant">
            Definí las columnas del kanban y sus colores.
          </p>
        </div>
      </div>

      {/* Formulario crear / editar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Editar estado" : "Nuevo estado"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: En revisión"
              />
            </div>
            <div className="w-24 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Orden</label>
              <Input
                type="number"
                min={1}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                placeholder="#"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-outline-variant bg-white p-1"
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

      {/* Lista de estados */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : estados.length === 0 ? (
            <p className="py-12 text-center text-sm text-on-surface-muted">
              Todavía no hay estados.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {estados.map((estado) => (
                <li key={estado.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-black/5"
                    style={{ backgroundColor: estado.color }}
                  />
                  <span className="flex-1 font-medium text-foreground">
                    {estado.nombre}
                  </span>
                  <span className="text-xs text-on-surface-muted">
                    orden {estado.orden}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => startEdit(estado)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar"
                    onClick={() => onDelete(estado)}
                  >
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
