import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CrearUsuarioInput, Permiso, UsuarioAdmin } from "@/types/usuario";

/** GET /usuarios — listado (solo ADMIN). */
export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<ApiResponse<UsuarioAdmin[]>>("/usuarios");
  return data.data;
}

/** POST /usuarios — alta de empleado (solo ADMIN). */
export async function crearUsuario(input: CrearUsuarioInput): Promise<UsuarioAdmin> {
  const { data } = await api.post<ApiResponse<UsuarioAdmin>>("/usuarios", input);
  return data.data;
}

/** PUT /usuarios/{id}/permisos — reemplaza los permisos del empleado. */
export async function actualizarPermisos(
  id: number,
  permisos: Permiso[]
): Promise<void> {
  await api.put(`/usuarios/${id}/permisos`, { permisos });
}

/** PATCH /usuarios/{id}/estado — activar/desactivar. */
export async function cambiarEstadoUsuario(
  id: number,
  activo: boolean
): Promise<UsuarioAdmin> {
  const { data } = await api.patch<ApiResponse<UsuarioAdmin>>(
    `/usuarios/${id}/estado`,
    { activo }
  );
  return data.data;
}
