import type { Estado, EstadoRef } from "@/types/estado";
import type { Pedido } from "@/types/pedido";

/**
 * "Base de datos" en memoria para los mocks MSW de Sprint 2.
 * Sembrada con los mismos estados/colores que `setup_supabase.sql`.
 * Es mutable: los handlers de POST/PUT/DELETE la modifican en caliente.
 */

export const estados: Estado[] = [
  { id: 1, nombre: "Recibido", orden: 1, color: "#0C447C" },
  { id: 2, nombre: "En tránsito", orden: 2, color: "#854F0B" },
  { id: 3, nombre: "En aduana", orden: 3, color: "#3C3489" },
  { id: 4, nombre: "En almacén", orden: 4, color: "#1B2A5E" },
  { id: 5, nombre: "Entregado", orden: 5, color: "#085041" },
];

/** Versión ligera del estado para anidar en un pedido. */
export function toEstadoRef(estado: Estado): EstadoRef {
  return { id: estado.id, nombre: estado.nombre, color: estado.color };
}

const ref = (id: number): EstadoRef => toEstadoRef(estados.find((e) => e.id === id)!);

export const pedidos: Pedido[] = [
  {
    id: 1,
    comunidad: "Comunidad Norte",
    titular: "Carlos Pérez",
    consignatario: "María Pérez",
    num_orden: "ORD-001234",
    num_tracking: "TRK-001234",
    whatsapp: "+51999111222",
    firma: "Carlos Pérez",
    valor_usd: 20,
    costo_importacion_usd: 29,
    tipo_envio: "almacen",
    estado: ref(3),
    productos: [{ id: 1, cantidad: 1, producto: "Audífonos Sony", marca: "Sony" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-10T10:00:00",
    actualizado_en: null,
  },
  {
    id: 2,
    titular: "Lucía Ramírez",
    num_orden: "ORD-001235",
    num_tracking: "TRK-001235",
    whatsapp: "+51999333444",
    valor_usd: 80,
    costo_importacion_usd: 45,
    tipo_envio: "lima",
    estado: ref(1),
    productos: [
      { id: 2, cantidad: 2, producto: "Polo algodón", marca: "Nike" },
      { id: 3, cantidad: 1, producto: "Gorra", marca: "Nike" },
    ],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-12T15:30:00",
    actualizado_en: null,
  },
  {
    id: 3,
    titular: "Andrés Gómez",
    consignatario: "Sofía Gómez",
    num_orden: "ORD-001236",
    num_tracking: "TRK-001236",
    whatsapp: "+51999555666",
    valor_usd: 150,
    costo_importacion_usd: 60,
    tipo_envio: "shalom",
    estado: ref(2),
    productos: [{ id: 4, cantidad: 1, producto: "Teclado mecánico", marca: "Keychron" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-13T09:15:00",
    actualizado_en: null,
  },
  {
    id: 4,
    titular: "Valeria Castro",
    num_orden: "ORD-001237",
    num_tracking: "TRK-001237",
    whatsapp: "+51999777888",
    valor_usd: 40,
    costo_importacion_usd: 29,
    tipo_envio: null,
    estado: ref(1),
    productos: [{ id: 5, cantidad: 3, producto: "Cuaderno A5" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-14T11:45:00",
    actualizado_en: null,
  },
  {
    id: 5,
    titular: "Diego Flores",
    num_orden: "ORD-001238",
    num_tracking: "TRK-001238",
    whatsapp: "+51999000111",
    valor_usd: 200,
    costo_importacion_usd: 75,
    tipo_envio: "almacen",
    estado: ref(5),
    productos: [{ id: 6, cantidad: 1, producto: "Cámara web", marca: "Logitech" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-09T08:00:00",
    actualizado_en: "2026-06-15T17:00:00",
  },
  {
    id: 6,
    titular: "Camila Torres",
    num_orden: "ORD-001239",
    num_tracking: "TRK-001239",
    whatsapp: "+51999222333",
    valor_usd: 35,
    costo_importacion_usd: 29,
    tipo_envio: "lima",
    estado: ref(4),
    productos: [{ id: 7, cantidad: 2, producto: "Mouse inalámbrico", marca: "Logitech" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-15T14:20:00",
    actualizado_en: null,
  },
];

/** Generadores de IDs incrementales (arrancan por encima de lo sembrado). */
let nextEstadoId = 6;
let nextPedidoId = 7;
let nextProductoId = 8;

export const nextId = {
  estado: () => nextEstadoId++,
  pedido: () => nextPedidoId++,
  producto: () => nextProductoId++,
};

/**
 * Configuración del cotizador y del negocio (Sprint 3). Mutable: el PUT del
 * admin la modifica. Sembrada con los valores de `setup_supabase.sql`.
 */
export const config = {
  flete_por_kilo: 10,
  desaduanaje: 9,
  umbral_asesor: 200,
  whatsapp_atencion: "+51999999999",
  nombre_negocio: "Orión Logistic",
  tipo_cambio: 3.4,
};
