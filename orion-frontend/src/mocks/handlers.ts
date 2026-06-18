import { http, HttpResponse } from "msw";
import type { Usuario } from "@/types/usuario";
import type { EstadoInput } from "@/types/estado";
import type { Pedido, PedidoInput, PedidoListItem } from "@/types/pedido";
import { estados, nextId, pedidos, toEstadoRef } from "@/mocks/db";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/* ------------------------------------------------------------------ */
/* Helpers para respetar el sobre ApiResponse (doc 05.1)              */
/* ------------------------------------------------------------------ */

function ok<T>(data: T, message = "Operación exitosa", status = 200) {
  return HttpResponse.json({ success: true, data, message }, { status });
}

function fail(error: string, code: string, status: number) {
  return HttpResponse.json({ success: false, error, code }, { status });
}

function toListItem(p: Pedido): PedidoListItem {
  return {
    id: p.id,
    num_orden: p.num_orden,
    num_tracking: p.num_tracking,
    titular: p.titular,
    whatsapp: p.whatsapp,
    valor_usd: p.valor_usd,
    costo_importacion_usd: p.costo_importacion_usd,
    tipo_envio: p.tipo_envio,
    estado: p.estado,
    creado_en: p.creado_en,
  };
}

/* ------------------------------------------------------------------ */
/* Auth (Sprint 1)                                                    */
/* ------------------------------------------------------------------ */

const MOCK_USERS: Record<string, { password: string; usuario: Usuario }> = {
  "joaquin@orionlogistic.com": {
    password: "admin123",
    usuario: {
      id: 1,
      nombre: "Joaquín Rodríguez",
      email: "joaquin@orionlogistic.com",
      rol: "ADMIN",
      avatar_color: "#D4AF37",
      password_temporal: false,
      permisos: [], // ADMIN → acceso total (ver @/lib/permisos)
    },
  },
  "jose@orionlogistic.com": {
    password: "temp123",
    usuario: {
      id: 2,
      nombre: "José García",
      email: "jose@orionlogistic.com",
      rol: "EMPLEADO",
      avatar_color: "#1B2A5E",
      password_temporal: true,
      permisos: [
        { modulo: "pedidos", puede_ver: true, puede_editar: true },
        { modulo: "tablero", puede_ver: true, puede_editar: true },
        { modulo: "finanzas", puede_ver: false, puede_editar: false },
        { modulo: "cotizador", puede_ver: true, puede_editar: false },
        { modulo: "configuracion", puede_ver: false, puede_editar: false },
      ],
    },
  },
};

const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibW9jayI6dHJ1ZX0.orion-mock-signature";

const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const entry = body.email ? MOCK_USERS[body.email.toLowerCase()] : undefined;

    if (!entry || entry.password !== body.password) {
      return fail("Credenciales inválidas", "AUTH_INVALID", 401);
    }
    return ok(
      { token: FAKE_JWT, usuario: entry.usuario },
      "Inicio de sesión exitoso"
    );
  }),

  http.post(`${BASE}/auth/cambiar-password`, async ({ request }) => {
    const body = (await request.json()) as {
      password_actual?: string;
      password_nueva?: string;
    };
    if (!body.password_actual || !body.password_nueva) {
      return fail("Faltan datos", "VALIDATION", 400);
    }
    // El backend real responde ApiResponse<Void> → data:null.
    return ok(null, "Contraseña actualizada");
  }),

  http.post(`${BASE}/auth/logout`, () => ok(null, "Sesión cerrada")),

  http.get(`${BASE}/config/publica`, () =>
    ok({ whatsapp_atencion: "+51999999999", nombre_negocio: "Orión Logistic" })
  ),
];

/* ------------------------------------------------------------------ */
/* Pedidos (Sprint 2)                                                 */
/* ------------------------------------------------------------------ */

const pedidoHandlers = [
  // GET /pedidos — listado con filtros + búsqueda + paginación
  http.get(`${BASE}/pedidos`, ({ request }) => {
    const url = new URL(request.url);
    const estadoId = url.searchParams.get("estado_id");
    const search = (url.searchParams.get("search") ?? "").toLowerCase().trim();
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtrados = [...pedidos];
    if (estadoId) {
      filtrados = filtrados.filter((p) => p.estado.id === Number(estadoId));
    }
    if (search) {
      filtrados = filtrados.filter(
        (p) =>
          p.titular.toLowerCase().includes(search) ||
          p.num_orden.toLowerCase().includes(search) ||
          p.num_tracking.toLowerCase().includes(search)
      );
    }
    filtrados.sort((a, b) => b.creado_en.localeCompare(a.creado_en));

    const total = filtrados.length;
    const inicio = page * size;
    const content = filtrados.slice(inicio, inicio + size).map(toListItem);

    return ok({
      content,
      page,
      size,
      total_elements: total,
      total_pages: Math.ceil(total / size),
    });
  }),

  // GET /pedidos/{id}
  http.get(`${BASE}/pedidos/:id`, ({ params }) => {
    const pedido = pedidos.find((p) => p.id === Number(params.id));
    return pedido ? ok(pedido) : fail("Pedido no encontrado", "NO_ENCONTRADO", 404);
  }),

  // POST /pedidos
  http.post(`${BASE}/pedidos`, async ({ request }) => {
    const body = (await request.json()) as PedidoInput;

    if (
      !body.titular ||
      !body.num_orden ||
      !body.num_tracking ||
      !body.whatsapp ||
      body.costo_importacion_usd == null
    ) {
      return fail("Faltan campos obligatorios", "VALIDATION", 400);
    }
    if (
      pedidos.some(
        (p) =>
          p.num_orden === body.num_orden || p.num_tracking === body.num_tracking
      )
    ) {
      return fail(
        "Ya existe un pedido con ese número de orden o tracking",
        "DUPLICADO",
        409
      );
    }

    const estadoId =
      body.estado_id ?? [...estados].sort((a, b) => a.orden - b.orden)[0].id;
    const estado = estados.find((e) => e.id === estadoId);
    if (!estado) return fail("Estado inexistente", "VALIDATION", 400);

    const nuevo: Pedido = {
      id: nextId.pedido(),
      comunidad: body.comunidad,
      titular: body.titular,
      consignatario: body.consignatario,
      num_orden: body.num_orden,
      num_tracking: body.num_tracking,
      whatsapp: body.whatsapp,
      firma: body.firma,
      valor_usd: body.valor_usd ?? 0,
      costo_importacion_usd: body.costo_importacion_usd,
      tipo_envio: body.tipo_envio ?? null,
      estado: toEstadoRef(estado),
      productos: (body.productos ?? []).map((pr) => ({
        id: nextId.producto(),
        ...pr,
      })),
      creado_por: { id: 1, nombre: "Joaquín" },
      creado_en: new Date().toISOString(),
      actualizado_en: null,
    };
    pedidos.push(nuevo);
    return ok(nuevo, "Pedido creado", 201);
  }),

  // PUT /pedidos/{id}
  http.put(`${BASE}/pedidos/:id`, async ({ params, request }) => {
    const idx = pedidos.findIndex((p) => p.id === Number(params.id));
    if (idx === -1) return fail("Pedido no encontrado", "NO_ENCONTRADO", 404);

    const body = (await request.json()) as PedidoInput;
    if (
      pedidos.some(
        (p) =>
          p.id !== Number(params.id) &&
          (p.num_orden === body.num_orden ||
            p.num_tracking === body.num_tracking)
      )
    ) {
      return fail(
        "Ya existe un pedido con ese número de orden o tracking",
        "DUPLICADO",
        409
      );
    }

    const estadoFull = estados.find(
      (e) => e.id === (body.estado_id ?? pedidos[idx].estado.id)
    );
    const actualizado: Pedido = {
      ...pedidos[idx],
      comunidad: body.comunidad,
      titular: body.titular,
      consignatario: body.consignatario,
      num_orden: body.num_orden,
      num_tracking: body.num_tracking,
      whatsapp: body.whatsapp,
      firma: body.firma,
      valor_usd: body.valor_usd ?? 0,
      costo_importacion_usd: body.costo_importacion_usd,
      tipo_envio: body.tipo_envio ?? null,
      estado: estadoFull ? toEstadoRef(estadoFull) : pedidos[idx].estado,
      productos: (body.productos ?? []).map((pr) => ({
        id: nextId.producto(),
        ...pr,
      })),
      actualizado_en: new Date().toISOString(),
    };
    pedidos[idx] = actualizado;
    return ok(actualizado, "Pedido actualizado");
  }),

  // PATCH /pedidos/{id}/estado
  http.patch(`${BASE}/pedidos/:id/estado`, async ({ params, request }) => {
    const pedido = pedidos.find((p) => p.id === Number(params.id));
    if (!pedido) return fail("Pedido no encontrado", "NO_ENCONTRADO", 404);

    const body = (await request.json()) as { estado_id?: number };
    const estado = estados.find((e) => e.id === body.estado_id);
    if (!estado) return fail("Estado inexistente", "VALIDATION", 400);

    pedido.estado = toEstadoRef(estado);
    pedido.actualizado_en = new Date().toISOString();
    return ok(pedido, "Estado actualizado");
  }),

  // DELETE /pedidos/{id}
  http.delete(`${BASE}/pedidos/:id`, ({ params }) => {
    const idx = pedidos.findIndex((p) => p.id === Number(params.id));
    if (idx === -1) return fail("Pedido no encontrado", "NO_ENCONTRADO", 404);
    pedidos.splice(idx, 1);
    return ok(null, "Pedido eliminado");
  }),
];

/* ------------------------------------------------------------------ */
/* Estados / Tablero (Sprint 2)                                       */
/* ------------------------------------------------------------------ */

const estadoHandlers = [
  // GET /estados
  http.get(`${BASE}/estados`, () =>
    ok([...estados].sort((a, b) => a.orden - b.orden))
  ),

  // GET /tablero — columnas con sus pedidos
  http.get(`${BASE}/tablero`, () => {
    const columnas = [...estados]
      .sort((a, b) => a.orden - b.orden)
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        color: e.color,
        pedidos: pedidos
          .filter((p) => p.estado.id === e.id)
          .map((p) => ({
            id: p.id,
            num_orden: p.num_orden,
            titular: p.titular,
            costo_importacion_usd: p.costo_importacion_usd,
          })),
      }));
    return ok(columnas);
  }),

  // POST /estados
  http.post(`${BASE}/estados`, async ({ request }) => {
    const body = (await request.json()) as EstadoInput;
    if (!body.nombre || body.orden == null) {
      return fail("Faltan campos obligatorios", "VALIDATION", 400);
    }
    const nuevo = {
      id: nextId.estado(),
      nombre: body.nombre,
      orden: body.orden,
      color: body.color ?? "#9CA3AF",
    };
    estados.push(nuevo);
    return ok(nuevo, "Estado creado", 201);
  }),

  // PUT /estados/{id}
  http.put(`${BASE}/estados/:id`, async ({ params, request }) => {
    const estado = estados.find((e) => e.id === Number(params.id));
    if (!estado) return fail("Estado no encontrado", "NO_ENCONTRADO", 404);

    const body = (await request.json()) as EstadoInput;
    estado.nombre = body.nombre;
    estado.orden = body.orden;
    estado.color = body.color;
    // Refrescar la referencia anidada en los pedidos afectados.
    pedidos.forEach((p) => {
      if (p.estado.id === estado.id) p.estado = toEstadoRef(estado);
    });
    return ok(estado, "Estado actualizado");
  }),

  // DELETE /estados/{id} — 409 si tiene pedidos asignados
  http.delete(`${BASE}/estados/:id`, ({ params }) => {
    const id = Number(params.id);
    const idx = estados.findIndex((e) => e.id === id);
    if (idx === -1) return fail("Estado no encontrado", "NO_ENCONTRADO", 404);
    if (pedidos.some((p) => p.estado.id === id)) {
      return fail(
        "Reasigná los pedidos antes de eliminar el estado",
        "ESTADO_EN_USO",
        409
      );
    }
    estados.splice(idx, 1);
    return ok(null, "Estado eliminado");
  }),
];

export const handlers = [...authHandlers, ...pedidoHandlers, ...estadoHandlers];
