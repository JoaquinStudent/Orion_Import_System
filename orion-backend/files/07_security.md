# 07 — Seguridad y Roles

> **SDD Orión Logistic** · Documento 7 de 9 · Versión 2.0
> Responsable: José (Backend)

---

## 7.1 Autenticación con JWT

El sistema usa **JSON Web Tokens (JWT)** para las sesiones del panel admin. Los clientes (app pública) no requieren autenticación.

### Flujo de autenticación

```
1. Usuario envía email + contraseña a POST /auth/login
2. Backend verifica la contraseña contra el hash (BCrypt)
3. Si es válida, genera un JWT firmado con JWT_SECRET
4. El token se devuelve al frontend
5. El frontend lo guarda (cookie httpOnly recomendada)
6. En cada petición protegida envía: Authorization: Bearer <token>
7. Spring Security valida el token antes de procesar
```

### Contenido del token (claims)

```json
{ "sub": "1", "email": "joaquin@orionlogistic.com", "rol": "ADMIN",
  "iat": 1718000000, "exp": 1718086400 }
```

- **Expiración:** 24 horas (configurable vía `JWT_EXPIRATION`).
- **Firma:** HMAC-SHA256 con `JWT_SECRET` (variable de entorno, nunca en el código).

---

## 7.2 Cifrado de contraseñas

Las contraseñas **nunca** se almacenan en texto plano. Se usa **BCrypt** (Spring Security) con factor de costo 10. Al crear un empleado, el admin define una contraseña temporal que el empleado debe cambiar en su primer inicio de sesión (`password_temporal = true`).

---

## 7.3 Roles del sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **ADMIN** | Dueño del negocio (Joaquín) | Total — todos los módulos |
| **EMPLEADO** | Trabajador (José, María...) | Limitado según permisos asignados |
| **(Cliente)** | Comprador final | Sin cuenta — solo endpoints públicos |

> El ADMIN no usa la tabla de permisos: su rol le da acceso total. Los permisos solo aplican a EMPLEADO.

---

## 7.4 Matriz de permisos

| Módulo | Permiso "Ver" | Permiso "Editar" |
|--------|---------------|------------------|
| **Pedidos** | Ver lista y detalle | Crear y editar pedidos |
| **Tablero** | Ver el tablero kanban | Cambiar estados, crear/editar estados |
| **Finanzas** | Ver ingresos y reportes | Exportar a Excel |
| **Cotizador** | Ver configuración | Editar flete y desaduanaje |
| **Configuración** | Ver ajustes | Editar ajustes, gestionar usuarios |

**Ejemplo típico de empleado:**
```
Pedidos:        Ver ✓  Editar ✓
Tablero:        Ver ✓  Editar ✓
Finanzas:       Ver ✗  Editar ✗   ← restringido
Cotizador:      Ver ✓  Editar ✗   ← solo lectura
Configuración:  Ver ✗  Editar ✗   ← restringido
```

> **Regla de negocio:** Solo el ADMIN puede gestionar usuarios y configuración del sistema.

---

## 7.5 Protección de endpoints

### Públicos (sin autenticación)
```
POST /auth/login
GET  /cotizador/config
POST /cotizador/calcular
GET  /cotizador/tipo-cambio
POST /rastreo
PATCH /rastreo/tipo-envio
GET  /config/publica
```

### Protegidos (JWT + permiso del módulo)
```
GET/POST/PUT  /pedidos/**       → permiso pedidos
GET/POST/...  /estados/**       → permiso tablero
GET           /tablero          → permiso tablero
GET           /finanzas/**      → permiso finanzas
```

### Solo ADMIN
```
GET/POST/PUT  /usuarios/**           → solo rol ADMIN
PUT           /admin/cotizador/**    → solo rol ADMIN (o permiso cotizador.editar)
PUT           /admin/config          → solo rol ADMIN
```

### Implementación en Spring Security

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/login",
                     "/api/v1/cotizador/**",
                     "/api/v1/rastreo/**",
                     "/api/v1/config/publica").permitAll()
    .requestMatchers("/api/v1/usuarios/**",
                     "/api/v1/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
);
```

Los permisos por módulo (más finos que el rol) se validan en la capa de servicio.

---

## 7.6 Seguridad del rastreador público

El rastreador es público pero valida **tracking + orden juntos**: solo si ambos coinciden en el mismo registro devuelve información (RNF-05). Un atacante con solo un número de tracking no puede acceder sin el número de orden correspondiente.

---

## 7.7 Otras medidas de seguridad

- **CORS**: configurado para aceptar solo el dominio del frontend.
- **HTTPS**: obligatorio en producción (Cloudflare y Railway lo proveen).
- **Validación de entrada**: todos los DTOs con Bean Validation (`@NotNull`, `@Email`).
- **Rate limiting**: recomendado en endpoints públicos (cotizador, rastreo).
- **Variables sensibles**: `JWT_SECRET`, `DATABASE_URL`, `EXCHANGE_API_KEY` en variables de entorno.
- **SQL injection**: prevenido por JPA con consultas parametrizadas.

---

## 7.8 Manejo de datos sensibles

- Las contraseñas se cifran con BCrypt (irreversible).
- Los WhatsApp de clientes no se exponen en endpoints públicos (salvo el del negocio).
- Las direcciones de almacén y datos operativos no se publican en la web.

---

*Anterior: [06 — UI](06_ui_design.md) · Siguiente: [08 — Plan de sprints →](08_sprints.md)*
