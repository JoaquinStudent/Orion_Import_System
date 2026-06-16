# 08 — Plan de Sprints (Scrum)

> **SDD Orión Logistic** · Documento 8 de 9 · Versión 2.0
> Responsable: Ambos (Joaquín + José)

---

## 8.1 Metodología

El proyecto se desarrolla con **Scrum** en **4 sprints de 1 semana** (4 semanas totales), equipo de 2 personas:

| Rol | Persona | Stack |
|-----|---------|-------|
| Frontend | **Joaquín** | Next.js · Tailwind · shadcn/ui · VS Code |
| Backend | **José** | Spring Boot · PostgreSQL · IntelliJ IDEA |

---

## 8.2 Ceremonias Scrum

| Ceremonia | Cuándo | Duración | Propósito |
|-----------|--------|----------|-----------|
| **Sprint Planning** | Lunes (inicio) | 30 min | Definir las tareas del sprint |
| **Daily Standup** | Cada día | 15 min | ¿Qué hice? ¿Qué haré? ¿Bloqueos? |
| **Sprint Review** | Viernes | 20 min | Demo de lo construido |
| **Retrospectiva** | Viernes | 15 min | ¿Qué mejorar para el siguiente sprint? |

---

## 8.3 Definition of Done (DoD)

Una tarea está **terminada** cuando:

- El código está en el repositorio (GitHub) en su rama correspondiente.
- El otro desarrollador revisó y aprobó el Pull Request.
- Funciona en el entorno de desarrollo sin errores.
- Si es backend: el endpoint está documentado en Postman/Swagger.
- Si es frontend: la pantalla es responsive en móvil.

---

## 8.4 Punto crítico — Día 1

> El **primer día del Sprint 1**, antes de escribir código, Joaquín y José acuerdan y documentan juntos el **contrato de la API** (endpoints, parámetros y forma de respuestas JSON) en Postman o Swagger. La referencia es el documento [05 — API](05_api_design.md).

---

## 8.5 Sprint 1 — Fundamentos y autenticación

**Meta:** El equipo puede iniciar sesión.

**Joaquín (Frontend):**
- Setup Next.js 14 + Tailwind + shadcn/ui.
- Estructura de carpetas y rutas (público / admin).
- Pantalla de login + validación.
- Layout base del panel admin (sidebar + topbar).
- Integración del JWT (guardar token, proteger rutas).

**José (Backend):**
- Setup Spring Boot 3 + Maven + dependencias.
- Conexión a Supabase PostgreSQL.
- Entidades: Usuario, Permiso.
- Autenticación JWT con Spring Security.
- Endpoints: login, cambiar contraseña, logout.

**Compartido:** Día 1 acordar el contrato de la API en Postman; configurar GitHub.

---

## 8.6 Sprint 2 — Pedidos y tablero

**Meta:** Registrar un pedido y verlo en el tablero.

**Joaquín:**
- Formulario de registro de pedido (todos los campos + montos USD).
- Lista de pedidos con filtros y búsqueda.
- Detalle de pedido con botón de WhatsApp.
- Tablero visual de estados (kanban).
- CRUD de estados personalizados.

**José:**
- API CRUD de pedidos.
- API de gestión de estados.
- API de cambio de estado de un pedido.
- Entidades: Pedido, Producto, Estado.
- CRUD de roles y permisos de empleados.

---

## 8.7 Sprint 3 — Finanzas, cotizador y landing

**Meta:** El cliente puede cotizar y el admin ve sus ingresos.

**Joaquín:**
- Dashboard de finanzas (gráficos en USD).
- Botón de exportar a Excel.
- Landing page pública.
- Cotizador público simplificado (3 pantallas).
- Configuración del cotizador en el admin (flete + desaduanaje).

**José:**
- API de finanzas (ingresos por día/mes/año).
- Generación de reporte Excel (Apache POI).
- API de configuración del cotizador.
- Integración con ExchangeRate-API (cacheada).
- Lógica del cotizador (umbral $200, redondeo de peso).

---

## 8.8 Sprint 4 — Rastreador, envíos, pruebas y deploy

**Meta:** Sistema completo en producción.

**Joaquín:**
- Rastreador de pedido (3 estados).
- Selector de tipo de envío.
- Gestión de usuarios y asignación de permisos.
- Responsive final en móvil.
- Deploy en Cloudflare Pages.

**José:**
- API del rastreador público (valida tracking + orden).
- API del selector de tipo de envío.
- API de configuración del WhatsApp.
- Deploy en Railway + variables de entorno.
- Pruebas finales y corrección de bugs.

**Compartido:** Pruebas de integración, revisión con el cliente, entrega.

---

## 8.9 Resumen visual del cronograma

| Semana | Frontend (Joaquín) | Backend (José) | Entregable |
|--------|--------------------|--------------------|------------|
| **1** | Login + layout admin | Auth JWT + BD | El equipo puede ingresar |
| **2** | Pedidos + tablero | API pedidos + estados | Registrar y rastrear pedidos |
| **3** | Finanzas + landing + cotizador | Finanzas + cotizador + dólar | Cotizar y ver ingresos |
| **4** | Rastreador + envíos + deploy | Rastreador + envíos + deploy | Sistema completo en vivo |

---

## 8.10 Gestión del proyecto

- **Tablero de tareas:** Trello o Linear. Cada tarea de este documento es una tarjeta.
- **Repositorio:** GitHub con ramas `frontend` y `backend`, feature branches por tarea.
- **Documentación de API:** Postman o Swagger, actualizada desde el día 1.
- **Comunicación:** daily de 15 min + canal directo para bloqueos.

---

## 8.11 Criterios de entrega final

- Ambas aplicaciones (admin y cliente) desplegadas y accesibles.
- El cotizador calcula correctamente (caso <$200) y deriva a asesor (caso >$200).
- Se pueden registrar pedidos y cambiar sus estados.
- El rastreador funciona con tracking + orden.
- Finanzas muestra ingresos y exporta a Excel.
- La gestión de usuarios y permisos funciona.
- Todo es responsive en móvil.
- Se entrega un manual básico de uso al cliente.

---

*Anterior: [07 — Seguridad](07_security.md) · Siguiente: [08b — Plan diario →](08b_plan_diario.md)*
