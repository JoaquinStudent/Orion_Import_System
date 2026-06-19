"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
  Power,
  PowerOff,
} from "lucide-react";

import {
  listarUsuarios,
  crearUsuario,
  actualizarPermisos,
  cambiarEstadoUsuario,
} from "@/lib/services/usuarios";
import { getApiErrorMessage } from "@/lib/api";
import { getIniciales } from "@/lib/constants";
import type { Modulo, Permiso, UsuarioAdmin } from "@/types/usuario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const COLORES = ["#1B2A5E", "#0C447C", "#085041", "#D4AF37", "#7F77DD", "#C0392B"];

const MODULOS: { key: Modulo; label: string; desc: string }[] = [
  { key: "pedidos", label: "Pedidos", desc: "Registrar y ver pedidos" },
  { key: "tablero", label: "Tablero", desc: "Cambiar el estado" },
  { key: "finanzas", label: "Finanzas", desc: "Ver ingresos" },
  { key: "cotizador", label: "Cotizador", desc: "Ver y configurar tarifas" },
  { key: "configuracion", label: "Configuración", desc: "Gestionar usuarios" },
];

type Perms = Record<Modulo, { ver: boolean; editar: boolean }>;

const PERMS_VACIO: Perms = {
  pedidos: { ver: false, editar: false },
  tablero: { ver: false, editar: false },
  finanzas: { ver: false, editar: false },
  cotizador: { ver: false, editar: false },
  configuracion: { ver: false, editar: false },
};

function aPerms(permisos: Permiso[] = []): Perms {
  const p: Perms = JSON.parse(JSON.stringify(PERMS_VACIO));
  for (const x of permisos) {
    if (p[x.modulo]) p[x.modulo] = { ver: x.puede_ver, editar: x.puede_editar };
  }
  return p;
}

export function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // crear empleado
  const [crearOpen, setCrearOpen] = useState(false);
  // permisos
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      setUsuarios(await listarUsuarios());
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudieron cargar los usuarios"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  async function onToggleEstado(u: UsuarioAdmin) {
    try {
      await cambiarEstadoUsuario(u.id, !u.activo);
      toast.success(u.activo ? "Empleado desactivado" : "Empleado activado");
      fetchUsuarios();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudo cambiar el estado"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Usuarios del sistema</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usuarios.map((u) => (
              <div key={u.id} className="rounded-xl border border-outline-variant p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: u.avatar_color ?? "#1B2A5E" }}
                  >
                    {getIniciales(u.nombre)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{u.nombre}</p>
                    <p className="truncate text-xs text-on-surface-muted">{u.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.rol === "ADMIN"
                        ? "bg-gold/20 text-gold-dark"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    {u.rol === "ADMIN" ? "Administrador" : "Empleado"}
                  </span>
                  <span className={`text-xs ${u.activo ? "text-emerald-600" : "text-on-surface-muted"}`}>
                    ● {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-outline-variant pt-3 text-sm">
                  {u.rol === "ADMIN" ? (
                    <span className="text-xs italic text-on-surface-muted">
                      Permisos completos — no editables
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditando(u)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <ShieldCheck className="h-4 w-4" /> Editar permisos
                      </button>
                      <button
                        onClick={() => onToggleEstado(u)}
                        className={`ml-auto inline-flex items-center gap-1 font-medium ${
                          u.activo ? "text-destructive" : "text-emerald-600"
                        } hover:underline`}
                      >
                        {u.activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Card agregar */}
            <button
              onClick={() => setCrearOpen(true)}
              className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-sm font-medium">Agregar empleado</span>
            </button>
          </div>
        )}
      </CardContent>

      <CrearEmpleadoSheet
        open={crearOpen}
        onOpenChange={setCrearOpen}
        onCreated={fetchUsuarios}
      />
      <PermisosSheet
        usuario={editando}
        onClose={() => setEditando(null)}
        onSaved={fetchUsuarios}
      />
    </Card>
  );
}

/* ---------- Sheet: crear empleado ---------- */
function CrearEmpleadoSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [color, setColor] = useState(COLORES[0]);
  const [saving, setSaving] = useState(false);

  function reset() {
    setNombre(""); setEmail(""); setPassword(""); setColor(COLORES[0]); setVerPass(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || password.length < 6) {
      toast.error("Completá nombre, email y una contraseña de al menos 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      await crearUsuario({
        nombre: nombre.trim(),
        email: email.trim(),
        rol: "EMPLEADO",
        password_temporal: password,
        avatar_color: color,
      });
      toast.success("Empleado creado");
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo crear el empleado"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Agregar empleado</SheetTitle>
          <SheetDescription>
            El empleado recibirá acceso según los permisos que asignes después.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nombre completo</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: María García" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Correo electrónico</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@orionlogistic.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Contraseña temporal</label>
            <div className="relative">
              <Input
                type={verPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
              />
              <button type="button" onClick={() => setVerPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted">
                {verPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-on-surface-muted">La deberá cambiar en su primer inicio de sesión.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Color del avatar</label>
            <div className="flex gap-2">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-primary" : ""}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Crear empleado
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Sheet: asignación de permisos ---------- */
function PermisosSheet({
  usuario,
  onClose,
  onSaved,
}: {
  usuario: UsuarioAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [perms, setPerms] = useState<Perms>(PERMS_VACIO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (usuario) setPerms(aPerms(usuario.permisos));
  }, [usuario]);

  function toggle(m: Modulo, campo: "ver" | "editar") {
    setPerms((prev) => {
      const next = { ...prev, [m]: { ...prev[m] } };
      next[m][campo] = !next[m][campo];
      if (campo === "editar" && next[m].editar) next[m].ver = true; // editar implica ver
      if (campo === "ver" && !next[m].ver) next[m].editar = false;
      return next;
    });
  }

  async function guardar() {
    if (!usuario) return;
    setSaving(true);
    try {
      const permisos: Permiso[] = MODULOS.map((m) => ({
        modulo: m.key,
        puede_ver: perms[m.key].ver,
        puede_editar: perms[m.key].editar,
      }));
      await actualizarPermisos(usuario.id, permisos);
      toast.success("Permisos actualizados");
      onClose();
      onSaved();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudieron guardar los permisos"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={usuario !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Asignación de permisos</SheetTitle>
          <SheetDescription>
            {usuario ? `Definí qué puede ver y hacer ${usuario.nombre.split(" ")[0]}.` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2 text-xs uppercase tracking-wide text-on-surface-muted">
            <span>Módulo</span>
            <span className="flex gap-6"><span>Ver</span><span>Editar</span></span>
          </div>
          {MODULOS.map((m) => (
            <div key={m.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-on-surface-muted">{m.desc}</p>
              </div>
              <div className="flex gap-6">
                <Toggle on={perms[m.key].ver} onClick={() => toggle(m.key, "ver")} />
                <Toggle on={perms[m.key].editar} onClick={() => toggle(m.key, "editar")} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            Guardar permisos
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-outline-variant"}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
