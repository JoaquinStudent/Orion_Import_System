import type { Estado, EstadoRef } from "@/types/estado";
import type { EstadoPago, Pedido } from "@/types/pedido";
import type { Comunidad } from "@/types/comunidad";
import type { Permiso, Rol } from "@/types/usuario";

/**
 * "Base de datos" en memoria para los mocks MSW.
 * Sembrada con los mismos estados/colores/comunidades que `setup_supabase.sql`.
 * Es mutable: los handlers de POST/PUT/DELETE/PATCH la modifican en caliente.
 */

export const estados: Estado[] = [
  { id: 1, nombre: "Recibido", orden: 1, color: "#0C447C" },
  { id: 2, nombre: "En tránsito", orden: 2, color: "#854F0B" },
  { id: 3, nombre: "En aduana", orden: 3, color: "#3C3489" },
  { id: 4, nombre: "En almacén", orden: 4, color: "#1B2A5E" },
  { id: 5, nombre: "Entregado", orden: 5, color: "#085041" },
];

/** Catálogo de comunidades (Sprint 3.5) — administrado desde /admin/configuracion. */
export const comunidades: Comunidad[] = [
  { id: 1, nombre: "Comunidad Norte", activo: true },
  { id: 2, nombre: "Comunidad Centro", activo: true },
  { id: 3, nombre: "Comunidad Sur", activo: true },
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
    estado_pago: "pendiente",
    productos: [{ id: 1, cantidad: 1, producto: "Audífonos Sony", marca: "Sony" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-10T10:00:00",
    actualizado_en: null,
  },
  {
    id: 2,
    comunidad: "Comunidad Centro",
    titular: "Lucía Ramírez",
    num_orden: "ORD-001235",
    num_tracking: "TRK-001235",
    whatsapp: "+51999333444",
    valor_usd: 80,
    costo_importacion_usd: 45,
    tipo_envio: "lima",
    estado: ref(1),
    estado_pago: "pendiente",
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
    comunidad: "Comunidad Norte",
    titular: "Andrés Gómez",
    consignatario: "Sofía Gómez",
    num_orden: "ORD-001236",
    num_tracking: "TRK-001236",
    whatsapp: "+51999555666",
    valor_usd: 150,
    costo_importacion_usd: 60,
    tipo_envio: "shalom",
    estado: ref(2),
    estado_pago: "liquidado",
    productos: [{ id: 4, cantidad: 1, producto: "Teclado mecánico", marca: "Keychron" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-13T09:15:00",
    actualizado_en: null,
  },
  {
    id: 4,
    comunidad: "Comunidad Sur",
    titular: "Valeria Castro",
    num_orden: "ORD-001237",
    num_tracking: "TRK-001237",
    whatsapp: "+51999777888",
    valor_usd: 40,
    costo_importacion_usd: 29,
    tipo_envio: null,
    estado: ref(1),
    estado_pago: "pendiente",
    productos: [{ id: 5, cantidad: 3, producto: "Cuaderno A5" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-14T11:45:00",
    actualizado_en: null,
  },
  {
    id: 5,
    comunidad: "Comunidad Centro",
    titular: "Diego Flores",
    num_orden: "ORD-001238",
    num_tracking: "TRK-001238",
    whatsapp: "+51999000111",
    valor_usd: 200,
    costo_importacion_usd: 75,
    tipo_envio: "almacen",
    estado: ref(5),
    estado_pago: "liquidado",
    productos: [{ id: 6, cantidad: 1, producto: "Cámara web", marca: "Logitech" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-09T08:00:00",
    actualizado_en: "2026-06-15T17:00:00",
  },
  {
    id: 6,
    comunidad: "Comunidad Sur",
    titular: "Camila Torres",
    num_orden: "ORD-001239",
    num_tracking: "TRK-001239",
    whatsapp: "+51999222333",
    valor_usd: 35,
    costo_importacion_usd: 29,
    tipo_envio: "lima",
    estado: ref(4),
    estado_pago: "liquidado",
    productos: [{ id: 7, cantidad: 2, producto: "Mouse inalámbrico", marca: "Logitech" }],
    creado_por: { id: 1, nombre: "Joaquín" },
    creado_en: "2026-06-15T14:20:00",
    actualizado_en: null,
  },
  // --- Pedidos de demo extra para poblar el dashboard de finanzas (fechas 2026) ---
  ...demo(7, "Mateo Rojas", "almacen", 45, 1, "2026-06-18T09:00:00", "pendiente"),
  ...demo(8, "Renata Silva", "lima", 60, 2, "2026-06-18T16:30:00", "pendiente"),
  ...demo(9, "Bruno Díaz", "shalom", 38, 3, "2026-06-17T12:10:00", "liquidado"),
  ...demo(10, "Paula Vega", "almacen", 52, 5, "2026-06-05T10:00:00", "liquidado"),
  ...demo(11, "Iván Mora", "lima", 70, 5, "2026-05-20T11:30:00", "liquidado"),
  ...demo(12, "Sofía Núñez", "shalom", 33, 4, "2026-05-08T14:00:00", "liquidado"),
  ...demo(13, "Tomás Vera", "almacen", 88, 5, "2026-04-15T09:45:00", "liquidado"),
  ...demo(14, "Lara Pinto", "lima", 41, 5, "2026-03-10T13:20:00", "liquidado"),
  ...demo(15, "Hugo Salas", "almacen", 120, 5, "2026-02-22T08:30:00", "liquidado"),
  ...demo(16, "Nadia Cruz", "shalom", 64, 5, "2026-01-30T17:00:00", "pendiente"),
];

/** Helper para sembrar pedidos de demo sin repetir todo el objeto. */
function demo(
  id: number,
  titular: string,
  tipoEnvio: Pedido["tipo_envio"],
  costo: number,
  estadoId: number,
  creadoEn: string,
  pago: EstadoPago
): Pedido[] {
  return [
    {
      id,
      titular,
      num_orden: `ORD-00${1233 + id}`,
      num_tracking: `TRK-00${1233 + id}`,
      whatsapp: "+51999000000",
      valor_usd: Math.round(costo * 0.7),
      costo_importacion_usd: costo,
      tipo_envio: tipoEnvio,
      estado: ref(estadoId),
      estado_pago: pago,
      productos: [],
      creado_por: { id: 1, nombre: "Joaquín" },
      creado_en: creadoEn,
      actualizado_en: null,
    },
  ];
}

/** Usuarios del sistema (gestión admin). Incluye permisos por módulo. */
export interface UsuarioMock {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  avatar_color: string;
  activo: boolean;
  permisos: Permiso[];
}

export const usuarios: UsuarioMock[] = [
  {
    id: 1,
    nombre: "Joaquín Rodríguez",
    email: "joaquin@orionlogistic.com",
    rol: "ADMIN",
    avatar_color: "#D4AF37",
    activo: true,
    permisos: [], // ADMIN → acceso total implícito
  },
  {
    id: 2,
    nombre: "José Salinas",
    email: "jose@orionlogistic.com",
    rol: "EMPLEADO",
    avatar_color: "#1B2A5E",
    activo: true,
    permisos: [
      { modulo: "pedidos", puede_ver: true, puede_editar: true },
      { modulo: "tablero", puede_ver: true, puede_editar: true },
      { modulo: "finanzas", puede_ver: false, puede_editar: false },
      { modulo: "cotizador", puede_ver: true, puede_editar: false },
      { modulo: "configuracion", puede_ver: false, puede_editar: false },
    ],
  },
];

/** Generadores de IDs incrementales (arrancan por encima de lo sembrado). */
let nextEstadoId = 6;
let nextPedidoId = 17;
let nextProductoId = 8;
let nextComunidadId = 4;
let nextUsuarioId = 3;

export const nextId = {
  estado: () => nextEstadoId++,
  pedido: () => nextPedidoId++,
  producto: () => nextProductoId++,
  comunidad: () => nextComunidadId++,
  usuario: () => nextUsuarioId++,
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
  dias_archivo_entregados: 7,
};
