/** Estado del tablero kanban (tabla `estados`, doc 05b). */
export interface Estado {
  id: number;
  nombre: string;
  orden: number;
  color: string;
}

/** Referencia ligera al estado, tal como viene anidada dentro de un pedido. */
export type EstadoRef = Pick<Estado, "id" | "nombre" | "color">;

/** Payload para crear o editar un estado (POST/PUT /estados). */
export interface EstadoInput {
  nombre: string;
  orden: number;
  color: string;
}
