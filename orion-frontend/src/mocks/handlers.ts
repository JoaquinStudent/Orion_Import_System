import { http, HttpResponse } from "msw";
import type { Usuario } from "@/types/usuario";
import type { EstadoInput } from "@/types/estado";
import type { Pedido, PedidoInput, PedidoListItem } from "@/types/pedido";
import { comunidades, config, estados, nextId, pedidos, toEstadoRef } from "@/mocks/db";

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
    estado_pago: p.estado_pago,
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
    ok({
      whatsapp_atencion: config.whatsapp_atencion,
      nombre_negocio: config.nombre_negocio,
    })
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
      estado_pago: "pendiente",
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

  // PATCH /pedidos/{id}/pago — estado de pago de la importación
  http.patch(`${BASE}/pedidos/:id/pago`, async ({ params, request }) => {
    const pedido = pedidos.find((p) => p.id === Number(params.id));
    if (!pedido) return fail("Pedido no encontrado", "NO_ENCONTRADO", 404);

    const body = (await request.json()) as { estado_pago?: "pendiente" | "liquidado" };
    if (body.estado_pago !== "pendiente" && body.estado_pago !== "liquidado") {
      return fail("Estado de pago inválido", "VALIDATION", 400);
    }
    pedido.estado_pago = body.estado_pago;
    pedido.actualizado_en = new Date().toISOString();
    return ok(pedido, "Estado de pago actualizado");
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

/* ------------------------------------------------------------------ */
/* Cotizador (Sprint 3)                                               */
/* ------------------------------------------------------------------ */

const cotizadorHandlers = [
  // GET /cotizador/config (público)
  http.get(`${BASE}/cotizador/config`, () =>
    ok({
      flete_por_kilo: config.flete_por_kilo,
      desaduanaje: config.desaduanaje,
      umbral_asesor: config.umbral_asesor,
      whatsapp_atencion: config.whatsapp_atencion,
    })
  ),

  // GET /cotizador/tipo-cambio (público)
  http.get(`${BASE}/cotizador/tipo-cambio`, () =>
    ok({ usd_pen: config.tipo_cambio, actualizado: new Date().toISOString() })
  ),

  // POST /cotizador/calcular (público) — implementa la fórmula del doc 05.5
  http.post(`${BASE}/cotizador/calcular`, async ({ request }) => {
    const body = (await request.json()) as { valor_usd?: number; peso_kg?: number };
    const valor = Number(body.valor_usd ?? 0);
    const peso = Number(body.peso_kg ?? 0);

    if (valor > config.umbral_asesor) {
      return ok({
        aplica_calculo: false,
        mensaje: `Para envíos mayores a $${config.umbral_asesor}, contacta con un asesor`,
        whatsapp_atencion: config.whatsapp_atencion,
      });
    }

    const pesoCobrado = Math.ceil(peso);
    const flete = pesoCobrado * config.flete_por_kilo;
    const totalUsd = flete + config.desaduanaje;
    return ok({
      aplica_calculo: true,
      valor_usd: valor,
      peso_real_kg: peso,
      peso_cobrado_kg: pesoCobrado,
      flete_usd: flete,
      desaduanaje_usd: config.desaduanaje,
      total_usd: totalUsd,
      tipo_cambio: config.tipo_cambio,
      total_pen: Number((totalUsd * config.tipo_cambio).toFixed(2)),
    });
  }),

  // PUT /admin/cotizador/config (admin)
  http.put(`${BASE}/admin/cotizador/config`, async ({ request }) => {
    const body = (await request.json()) as {
      flete_por_kilo?: number;
      desaduanaje?: number;
    };
    if (body.flete_por_kilo != null) config.flete_por_kilo = Number(body.flete_por_kilo);
    if (body.desaduanaje != null) config.desaduanaje = Number(body.desaduanaje);
    return ok(
      {
        flete_por_kilo: config.flete_por_kilo,
        desaduanaje: config.desaduanaje,
        umbral_asesor: config.umbral_asesor,
        whatsapp_atencion: config.whatsapp_atencion,
      },
      "Configuración actualizada"
    );
  }),
];

/* ------------------------------------------------------------------ */
/* Finanzas (Sprint 3)                                                */
/* ------------------------------------------------------------------ */

const finanzasHandlers = [
  // GET /finanzas/resumen — honra desde/hasta/periodo, igual que el backend real
  http.get(`${BASE}/finanzas/resumen`, ({ request }) => {
    const url = new URL(request.url);
    const desde = url.searchParams.get("desde"); // yyyy-MM-dd
    const hasta = url.searchParams.get("hasta");
    const periodo = url.searchParams.get("periodo") ?? "mes";

    const enRango = pedidos.filter((p) => {
      const f = p.creado_en.slice(0, 10);
      if (desde && f < desde) return false;
      if (hasta && f > hasta) return false;
      return true;
    });

    const clave = (iso: string) => {
      const d = iso.slice(0, 10);
      if (periodo === "dia") return d; // yyyy-MM-dd
      if (periodo === "anio") return d.slice(0, 4); // yyyy
      return d.slice(0, 7); // mes → yyyy-MM
    };

    // Solo los pedidos con pago LIQUIDADO cuentan como ingreso.
    const liquidados = enRango.filter((p) => p.estado_pago === "liquidado");

    const porFecha = new Map<string, number>();
    for (const p of liquidados) {
      const k = clave(p.creado_en);
      porFecha.set(k, (porFecha.get(k) ?? 0) + p.costo_importacion_usd);
    }
    const serie = Array.from(porFecha.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, ingreso_usd]) => ({
        fecha,
        ingreso_usd: Number(ingreso_usd.toFixed(2)),
      }));
    const ingresoTotal = liquidados.reduce((s, p) => s + p.costo_importacion_usd, 0);
    return ok({
      ingreso_total_usd: Number(ingresoTotal.toFixed(2)),
      total_pedidos: enRango.length,
      serie,
    });
  }),

  // GET /finanzas/exportar — el backend real devuelve .xlsx; el mock un blob mínimo
  http.get(`${BASE}/finanzas/exportar`, () => {
    const csv = "fecha,ingreso_usd\n(mock) descarga simulada,0\n";
    return new HttpResponse(csv, {
      status: 200,
      headers: { "Content-Type": "application/vnd.ms-excel" },
    });
  }),
];

/* ------------------------------------------------------------------ */
/* Rastreo público (Sprint 4 back — acá mockeado)                     */
/* ------------------------------------------------------------------ */

function construirRastreo(p: Pedido) {
  const ordenActual = estados.find((e) => e.id === p.estado.id)?.orden ?? 0;
  const pasos = [...estados]
    .sort((a, b) => a.orden - b.orden)
    .map((e) => ({
      nombre: e.nombre,
      completado: e.orden < ordenActual,
      activo: e.orden === ordenActual,
    }));
  const maxOrden = Math.max(...estados.map((e) => e.orden));
  return {
    titular: p.titular,
    consignatario: p.consignatario ?? null,
    comunidad: p.comunidad ?? null,
    productos: p.productos.map((pr) => ({
      cantidad: pr.cantidad,
      producto: pr.producto,
      marca: pr.marca ?? null,
    })),
    estado_actual: p.estado.nombre,
    estados: pasos,
    tipo_envio: p.tipo_envio,
    puede_elegir_envio: ordenActual < maxOrden, // ya entregado → no elige
  };
}

function buscarParaRastreo(tracking?: string, orden?: string) {
  if (!tracking || !orden) return undefined;
  return pedidos.find(
    (p) =>
      p.num_tracking.toLowerCase() === tracking.toLowerCase().trim() &&
      p.num_orden.toLowerCase() === orden.toLowerCase().trim()
  );
}

const rastreoHandlers = [
  // POST /rastreo (público) — valida tracking + orden juntos
  http.post(`${BASE}/rastreo`, async ({ request }) => {
    const body = (await request.json()) as {
      num_tracking?: string;
      num_orden?: string;
    };
    const pedido = buscarParaRastreo(body.num_tracking, body.num_orden);
    if (!pedido) {
      return fail(
        "No encontramos un pedido con esos datos. Verificá el tracking y la orden.",
        "NO_ENCONTRADO",
        404
      );
    }
    return ok(construirRastreo(pedido));
  }),

  // PATCH /rastreo/tipo-envio (público) — el cliente elige cómo recibir
  http.patch(`${BASE}/rastreo/tipo-envio`, async ({ request }) => {
    const body = (await request.json()) as {
      num_tracking?: string;
      num_orden?: string;
      tipo_envio?: Pedido["tipo_envio"];
    };
    const pedido = buscarParaRastreo(body.num_tracking, body.num_orden);
    if (!pedido) {
      return fail("Pedido no encontrado", "NO_ENCONTRADO", 404);
    }
    pedido.tipo_envio = body.tipo_envio ?? pedido.tipo_envio;
    return ok(construirRastreo(pedido), "Tipo de envío confirmado");
  }),
];

/* ------------------------------------------------------------------ */
/* Comunidades (catálogo administrado)                                 */
/* ------------------------------------------------------------------ */

const comunidadHandlers = [
  // GET /comunidades — catálogo activo (para el combobox del alta de pedido)
  http.get(`${BASE}/comunidades`, () =>
    ok([...comunidades].sort((a, b) => a.nombre.localeCompare(b.nombre)))
  ),

  // POST /comunidades (ADMIN)
  http.post(`${BASE}/comunidades`, async ({ request }) => {
    const body = (await request.json()) as { nombre?: string };
    const nombre = body.nombre?.trim();
    if (!nombre) return fail("El nombre es obligatorio", "VALIDATION", 400);
    if (comunidades.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      return fail("Ya existe una comunidad con ese nombre", "DUPLICADO", 409);
    }
    const nueva = { id: nextId.comunidad(), nombre, activo: true };
    comunidades.push(nueva);
    return ok(nueva, "Comunidad creada", 201);
  }),

  // PUT /comunidades/{id} (ADMIN)
  http.put(`${BASE}/comunidades/:id`, async ({ params, request }) => {
    const c = comunidades.find((x) => x.id === Number(params.id));
    if (!c) return fail("Comunidad no encontrada", "NO_ENCONTRADO", 404);
    const body = (await request.json()) as { nombre?: string };
    const nombre = body.nombre?.trim();
    if (!nombre) return fail("El nombre es obligatorio", "VALIDATION", 400);
    if (
      comunidades.some(
        (x) => x.id !== c.id && x.nombre.toLowerCase() === nombre.toLowerCase()
      )
    ) {
      return fail("Ya existe una comunidad con ese nombre", "DUPLICADO", 409);
    }
    c.nombre = nombre;
    return ok(c, "Comunidad actualizada");
  }),

  // DELETE /comunidades/{id} (ADMIN)
  http.delete(`${BASE}/comunidades/:id`, ({ params }) => {
    const idx = comunidades.findIndex((x) => x.id === Number(params.id));
    if (idx === -1) return fail("Comunidad no encontrada", "NO_ENCONTRADO", 404);
    comunidades.splice(idx, 1);
    return ok(null, "Comunidad eliminada");
  }),
];

export const handlers = [
  ...authHandlers,
  ...pedidoHandlers,
  ...estadoHandlers,
  ...cotizadorHandlers,
  ...finanzasHandlers,
  ...rastreoHandlers,
  ...comunidadHandlers,
];
