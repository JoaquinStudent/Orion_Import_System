/** Comunidad del catálogo que administra el admin (para el combobox de pedidos). */
export interface Comunidad {
  id: number;
  nombre: string;
  /** Código que el admin comparte con la comunidad para registrar pedidos. */
  codigo?: string;
  activo: boolean;
}

/** Payload para crear/editar una comunidad. */
export interface ComunidadInput {
  nombre: string;
  codigo?: string;
}
