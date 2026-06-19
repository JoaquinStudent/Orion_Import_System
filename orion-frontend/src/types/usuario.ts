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

/** Usuario tal como lo devuelve POST /auth/login (doc 05.2 / 05b). */
export interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
  avatar_color?: string;
  password_temporal: boolean;
  /**
   * Permisos por módulo (solo aplican a EMPLEADO). Para ADMIN llega vacío
   * y se asume acceso total. Ver helpers en `@/lib/permisos`.
   */
  permisos?: Permiso[];
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

/** Usuario en el listado de administración (GET /usuarios). */
export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  avatar_color?: string;
  activo: boolean;
  /** Permisos por módulo (para precargar el drawer de permisos). */
  permisos?: Permiso[];
}

/** Alta de empleado (POST /usuarios). `password_temporal` es la clave inicial. */
export interface CrearUsuarioInput {
  nombre: string;
  email: string;
  rol: Rol;
  password_temporal: string;
  avatar_color?: string;
}
