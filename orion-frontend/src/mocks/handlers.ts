import { http, HttpResponse } from "msw";
import type { Usuario } from "@/types/usuario";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/**
 * Usuarios de prueba para el flujo de login (Sprint 1).
 * - admin: ya cambió su contraseña → entra directo al dashboard.
 * - empleado: password_temporal=true → debe cambiarla en el primer ingreso.
 */
const MOCK_USERS: Record<
  string,
  { password: string; usuario: Usuario }
> = {
  "joaquin@orionlogistic.com": {
    password: "admin123",
    usuario: {
      id: 1,
      nombre: "Joaquín Rodríguez",
      email: "joaquin@orionlogistic.com",
      rol: "ADMIN",
      avatar_color: "#D4AF37",
      password_temporal: false,
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
    },
  },
};

const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibW9jayI6dHJ1ZX0.orion-mock-signature";

export const handlers = [
  // POST /auth/login (público)
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const entry = body.email ? MOCK_USERS[body.email.toLowerCase()] : undefined;

    if (!entry || entry.password !== body.password) {
      return HttpResponse.json(
        {
          success: false,
          error: "Credenciales inválidas",
          code: "AUTH_INVALID",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { token: FAKE_JWT, usuario: entry.usuario },
      message: "Inicio de sesión exitoso",
    });
  }),

  // POST /auth/cambiar-password (protegido)
  http.post(`${BASE}/auth/cambiar-password`, async ({ request }) => {
    const body = (await request.json()) as {
      password_actual?: string;
      password_nueva?: string;
    };

    if (!body.password_actual || !body.password_nueva) {
      return HttpResponse.json(
        { success: false, error: "Faltan datos", code: "VALIDATION" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { password_temporal: false },
      message: "Contraseña actualizada",
    });
  }),

  // POST /auth/logout (protegido)
  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true, data: null, message: "Sesión cerrada" });
  }),

  // GET /config/publica (público)
  http.get(`${BASE}/config/publica`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        whatsapp_atencion: "+51999999999",
        nombre_negocio: "Orión Logistic",
      },
    });
  }),
];
