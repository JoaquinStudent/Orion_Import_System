# 08b — Plan Detallado Día por Día

> **SDD Orión Logistic** · Complemento del documento 08 · Versión 2.0
> Desglose diario para Joaquín (Frontend) y José (Backend)
> 4 semanas · 5 días laborables por semana

---

## Cómo leer este documento

Cada día tiene tareas separadas para **Joaquín (JQ · Frontend)** y **José (JS · Backend)**. Las tareas con 🔗 requieren coordinación. Al final de cada semana hay un entregable verificable. Daily de 15 min cada mañana.

---

# 🟦 SEMANA 1 — Fundamentos y Autenticación

> **Meta:** El equipo puede iniciar sesión en el panel.

## Día 1 (Lunes) — Setup y acuerdos

**🔗 Juntos (primera hora):**
- Crear **dos** repositorios en GitHub: `orion-frontend` y `orion-backend`, cada uno con su rama `main` y `develop`.
- Acordar el contrato de la API en Postman (respuesta estándar, nombres en `snake_case`, formato JWT).
- Crear el proyecto en Supabase y compartir la `DATABASE_URL`.
- Sacar el token gratuito de ExchangeRate-API.

**Joaquín:**
- Crear proyecto Next.js 14 con TypeScript y App Router.
- Instalar y configurar Tailwind CSS + shadcn/ui.
- Configurar los colores del design system (navy #1B2A5E, dorado #D4AF37) y la fuente Inter.
- Crear la estructura de carpetas (público / admin).

**José:**
- Crear proyecto Spring Boot 3 con Maven.
- Dependencias: Spring Web, Security, Data JPA, PostgreSQL Driver, jjwt, Lombok.
- Conectar a Supabase y verificar la conexión.
- Configurar `application.properties` con variables de entorno.

## Día 2 (Martes) — Modelos y estructura

**Joaquín:**
- Layout base del panel admin: sidebar (navy, 6 ítems) + topbar.
- Cliente Axios (`lib/api.ts`) apuntando a la API.
- Maquetar la pantalla de login (sin lógica aún).

**José:**
- Entidades `Usuario` y `Permiso` con anotaciones JPA.
- Spring Security base (cadena de filtros).
- `UsuarioRepository`.
- Crear las tablas en Supabase.

## Día 3 (Miércoles) — Autenticación

**Joaquín:**
- Conectar el formulario de login a la API.
- Guardado del token JWT.
- Rutas protegidas (redirige a login si no hay token).

**José:**
- `JwtService` (generar y validar tokens).
- `AuthController` y `AuthService`.
- Endpoint `POST /auth/login` con verificación BCrypt.
- 🔗 Probar el login con Joaquín de extremo a extremo.

## Día 4 (Jueves) — Cambio de contraseña y avatar

**Joaquín:**
- Pantalla de cambio de contraseña temporal (primer ingreso).
- Avatar del usuario en sidebar y topbar.
- Estados de error del login.

**José:**
- Endpoint `POST /auth/cambiar-password`.
- Endpoint `POST /auth/logout`.
- Lógica del flag `password_temporal`.
- Crear el usuario ADMIN inicial (seed).

## Día 5 (Viernes) — Cierre Sprint 1

**🔗 Juntos:** Sprint Review (demo del login completo), Retrospectiva, verificar el entregable.

**✅ Entregable Semana 1:** El admin puede iniciar sesión, cambiar su contraseña y ver el panel base con su avatar.

---

# 🟪 SEMANA 2 — Pedidos y Tablero

> **Meta:** Registrar un pedido y verlo en el tablero de estados.

## Día 6 (Lunes) — Modelo de pedidos

**🔗 Juntos:** Sprint Planning — revisar los endpoints de pedidos en Postman.

**Joaquín:**
- Maquetar el formulario de registro de pedido (todos los campos del documento 04).
- Campos de montos: valor del producto (USD) y costo de importación (USD).

**José:**
- Entidades `Pedido`, `Producto`, `Estado`.
- Repositorios correspondientes.
- Insertar los 5 estados por defecto (Recibido → Entregado).

## Día 7 (Martes) — API de pedidos

**Joaquín:**
- Validaciones del formulario (campos obligatorios, formato tracking/orden).
- Campo de firma (solo texto).

**José:**
- Endpoint `POST /pedidos` (crear).
- Endpoint `GET /pedidos` (listar con paginación y filtros).
- Endpoint `GET /pedidos/{id}` (detalle).
- 🔗 Probar el registro de un pedido con Joaquín.

## Día 8 (Miércoles) — Lista y detalle

**Joaquín:**
- Lista de pedidos con tabla, filtros y búsqueda.
- Detalle del pedido con botón de WhatsApp (enlace wa.me).
- Badges de estado con los colores del design system.

**José:**
- Endpoint `PUT /pedidos/{id}` (editar).
- Endpoint `PATCH /pedidos/{id}/estado` (cambiar estado).
- Generación automática de números ORD/TRK si aplica.

## Día 9 (Jueves) — Tablero kanban

**Joaquín:**
- Tablero visual de estados (columnas kanban).
- Tarjetas de pedido con cambio de estado.
- CRUD de estados personalizados.

**José:**
- Endpoint `GET /tablero` (pedidos agrupados por estado).
- Endpoints CRUD de estados.
- CRUD de usuarios/permisos (base para la semana 4).

## Día 10 (Viernes) — Cierre Sprint 2

**🔗 Juntos:** Sprint Review (demo registrar pedido + moverlo en el tablero), Retrospectiva.

**✅ Entregable Semana 2:** Se registra un pedido completo, se ve en la lista y se cambia su estado en el tablero.

---

# 🟩 SEMANA 3 — Finanzas, Cotizador y Landing

> **Meta:** El cliente puede cotizar y el admin ve sus ingresos.

## Día 11 (Lunes) — Cotizador backend

**🔗 Juntos:** Sprint Planning — revisar la lógica del cotizador simplificado.

**Joaquín:**
- Maquetar la landing page pública (sin info confidencial).

**José:**
- Insertar valores iniciales en `configuracion` (flete $10, desaduanaje $9, umbral $200).
- Integrar ExchangeRate-API con caché del tipo de cambio.
- Endpoint `GET /cotizador/config`.

## Día 12 (Martes) — Lógica de cálculo

**Joaquín:**
- Cotizador público: pantalla 1 (valor + peso) con detección live <$200 / >$200.
- Preview del redondeo de peso en vivo.

**José:**
- `CotizadorService`: lógica del cálculo simple.
- Redondeo de peso hacia arriba (`Math.ceil`).
- Regla del umbral $200 (calcula o deriva a asesor).
- Endpoint `POST /cotizador/calcular`.

## Día 13 (Miércoles) — Cotizador resultado y asesor

**Joaquín:**
- Pantalla 2: resultado con desglose (flete + desaduanaje + total soles).
- Pantalla 3: invitación amigable al asesor (>$200) con tono cálido.
- Conectar todo al endpoint de cálculo.

**José:**
- Endpoint `GET /cotizador/tipo-cambio`.
- Endpoint `PUT /admin/cotizador/config`.
- 🔗 Validar que el cálculo coincide con el ejemplo: $20 + 1.3kg → S/ 98.60.

## Día 14 (Jueves) — Finanzas

**Joaquín:**
- Dashboard de finanzas (KPIs + gráfico de ingresos en USD).
- Botón de exportar a Excel.
- Pantalla de configuración del cotizador (solo flete + desaduanaje).

**José:**
- Endpoint `GET /finanzas/resumen`.
- Endpoint `GET /finanzas/exportar` (Excel con Apache POI).
- Lógica: solo el costo de importación cuenta como ingreso.

## Día 15 (Viernes) — Cierre Sprint 3

**🔗 Juntos:** Sprint Review (demo cotizador completo + finanzas), Retrospectiva.

**✅ Entregable Semana 3:** El cliente cotiza envíos <$200, se deriva a asesor los >$200, y el admin ve sus ingresos con exportación a Excel.

---

# 🟧 SEMANA 4 — Rastreador, Envíos, Pruebas y Deploy

> **Meta:** Sistema completo en producción.

## Día 16 (Lunes) — Rastreador

**🔗 Juntos:** Sprint Planning — últimas funcionalidades + plan de deploy.

**Joaquín:**
- Rastreador: pantalla de búsqueda (tracking + orden).
- Rastreador: pantalla de resultado (línea de tiempo de estados).

**José:**
- Endpoint `POST /rastreo` (valida tracking + orden juntos).
- Lógica de la línea de tiempo de estados.

## Día 17 (Martes) — Tipo de envío

**Joaquín:**
- Selector de tipo de envío (almacén / Lima / Shalom).
- Pantalla de confirmación del envío elegido.

**José:**
- Endpoint `PATCH /rastreo/tipo-envio`.
- Reflejar el tipo de envío en el detalle del pedido del admin.

## Día 18 (Miércoles) — Usuarios y permisos

**Joaquín:**
- Pantalla de gestión de usuarios.
- Modal de crear empleado.
- Panel lateral de asignación de permisos.

**José:**
- Endpoints `POST /usuarios`, `PUT /usuarios/{id}/permisos`.
- Endpoint de configuración del WhatsApp de atención.
- Validación de permisos por módulo en los endpoints.

## Día 19 (Jueves) — Responsive y pruebas

**Joaquín:**
- Revisión responsive completa en móvil (ambas apps).
- Ajustes finales de UI y consistencia visual.
- 🔗 Pruebas de integración con José.

**José:**
- Configurar CORS para el dominio de producción.
- Pruebas de carga ligeras.
- 🔗 Corrección de bugs de integración.

## Día 20 (Viernes) — Deploy y entrega

**🔗 Juntos:**
- Deploy del backend en Railway (con variables de entorno).
- Deploy del frontend en Cloudflare Pages.
- Conectar el dominio orionlogisticperu.com.
- Prueba final de extremo a extremo en producción.
- Entrega del sistema + manual básico de uso.

**✅ Entregable Semana 4:** Sistema completo, desplegado y funcionando en producción.

---

## 📋 Checklist de pre-arranque (antes del Día 1)

- [ ] Repositorio GitHub creado con ramas frontend/backend
- [ ] Proyecto Supabase creado + DATABASE_URL obtenida
- [ ] Token de ExchangeRate-API
- [ ] Cuenta Railway (puede esperar a semana 4)
- [ ] Cuenta Cloudflare (puede esperar a semana 4)
- [ ] Dominio orionlogisticperu.com comprado
- [ ] Colección de Postman con el contrato de la API
- [ ] Tablero en Trello/Linear con las tarjetas
- [ ] Variables de entorno compartidas entre ambos

---

## ⚠️ Reglas de oro durante el desarrollo

1. **Daily de 15 min cada mañana** — qué hice, qué haré, bloqueos.
2. **Nunca mergear a main sin revisión del otro** (Pull Request).
3. **Si el contrato de la API cambia, avisar de inmediato.**
4. **Probar en móvil desde el inicio.**
5. **Commitear seguido** con mensajes claros.
6. **Si una tarea se atrasa**, moverla y avisar en el daily.

---

*Complemento de: [08 — Plan de sprints](08_sprints.md) · Siguiente: [09 — Galería de prompts →](09_galeria_prompts.md)*
