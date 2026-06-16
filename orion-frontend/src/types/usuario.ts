/** Roles y permisos del panel admin (SDD doc 07). */
export type Rol = "ADMIN" | "EMPLEADO";

export type Modulo =
  | "pedidos"
  | "tablero"
  | "finanzas"
  | "cotizador"
  | "configuracion";

export interface Permiso {
  modulo: Modulo;
  puede_ver: boolean;
  puede_editar: boolean;
}

/** Usuario tal como lo devuelve POST /auth/login (doc 05.2). */
export interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
  avatar_color?: string;
  password_temporal: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
