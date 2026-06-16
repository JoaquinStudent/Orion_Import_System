# 02 — Requerimientos

> **SDD Orión Logistic** · Documento 2 de 9 · Versión 2.0
> Responsable: Ambos (Joaquín + José)

---

## 2.1 Requerimientos Funcionales (RF)

### Panel de administración

**Autenticación y roles**

- **RF-01** El sistema debe permitir iniciar sesión con correo y contraseña.
- **RF-02** El sistema debe distinguir dos roles: Administrador y Empleado.
- **RF-03** El administrador debe poder crear cuentas de empleado con nombre, correo, contraseña temporal y color de avatar.
- **RF-04** El administrador debe poder asignar permisos por módulo (Ver / Editar) a cada empleado.
- **RF-05** El administrador debe poder activar o desactivar empleados.
- **RF-06** El sistema debe forzar al empleado a cambiar su contraseña temporal en el primer inicio de sesión.

**Registro de pedidos**

- **RF-07** El sistema debe permitir registrar un pedido con: comunidad, titular, consignatario (opcional), número de orden, número de tracking, descripción del producto (cantidad, producto, marca), WhatsApp del cliente y firma (texto del nombre).
- **RF-08** El sistema debe permitir registrar el **valor del producto en USD** (informativo) y el **costo de importación en USD** (ingreso de la empresa).
- **RF-09** El pedido debe guardarse con un estado inicial y quedar disponible para rastreo por el cliente.
- **RF-10** El sistema debe permitir agregar más de un producto a un mismo pedido.
- **RF-11** El sistema debe mostrar el WhatsApp del cliente con acceso directo de contacto desde el detalle del pedido.

**Tablero de estados**

- **RF-12** El administrador debe poder crear, editar, reordenar y eliminar estados del tablero.
- **RF-13** El sistema debe mostrar todos los pedidos organizados por estado (vista kanban).
- **RF-14** El usuario debe poder cambiar el estado de un pedido, reflejándose de inmediato en el rastreador del cliente.
- **RF-15** El sistema debe mostrar el tipo de envío elegido por el cliente en el detalle del pedido.

**Finanzas**

- **RF-16** El sistema debe mostrar los ingresos por día, mes y año, calculados a partir del costo de importación de cada pedido.
- **RF-17** Los montos financieros deben mostrarse en USD.
- **RF-18** El sistema debe permitir filtrar los ingresos por rango de fechas.
- **RF-19** El sistema debe permitir exportar los reportes financieros a Excel.
- **RF-20** El valor del producto NO debe contarse como ingreso (solo el costo de importación).

**Configuración del cotizador**

- **RF-21** El administrador debe poder configurar el **precio del flete por kilo** (USD).
- **RF-22** El administrador debe poder configurar el **desaduanaje** (USD, valor fijo).
- **RF-23** Los cambios en la configuración deben reflejarse de inmediato en el cotizador público.

**Configuración general**

- **RF-24** El administrador debe poder configurar el número de WhatsApp de atención al cliente.
- **RF-25** El número de WhatsApp debe aparecer en la landing page, el cotizador y el rastreador.

### Aplicación del cliente

**Landing page**

- **RF-26** El sistema debe mostrar una página pública con la información del negocio, servicios y accesos al cotizador y rastreador.
- **RF-27** La landing debe mostrar un botón de WhatsApp siempre visible.
- **RF-28** La landing NO debe exponer información confidencial (direcciones exactas de almacén, teléfonos internos, horarios de cierre).

**Cotizador público (simplificado)**

- **RF-29** El cliente debe poder ingresar el valor del producto en USD y el peso en kg.
- **RF-30** El sistema debe detectar automáticamente si el valor es menor o mayor a $200.
- **RF-31** Si el valor es **menor a $200**, el sistema debe calcular: flete (peso redondeado hacia arriba × precio por kilo) + desaduanaje.
- **RF-32** El sistema debe redondear el peso hacia arriba (ceiling) para el cálculo del flete (1.3 kg → 2 kg).
- **RF-33** El sistema debe mostrar el resultado desglosado con el total en soles usando el tipo de cambio en vivo.
- **RF-34** Si el valor es **mayor a $200**, el sistema NO debe calcular: debe mostrar una invitación amigable a contactar un asesor por WhatsApp.
- **RF-35** La cotización es de solo lectura: no se guarda ni requiere registro.

**Rastreador de pedido**

- **RF-36** El cliente debe poder rastrear su pedido ingresando número de tracking y número de orden.
- **RF-37** El sistema debe mostrar un resumen del pedido y su estado actual en una línea de tiempo visual.
- **RF-38** El cliente debe poder seleccionar su tipo de envío: recojo en almacén, delivery en Lima o provincia por Shalom.
- **RF-39** La selección del tipo de envío debe reflejarse en el panel del administrador.
- **RF-40** El cliente solo puede visualizar y seleccionar el tipo de envío; no puede editar ningún otro dato.

---

## 2.2 Requerimientos No Funcionales (RNF)

### Seguridad

- **RNF-01** Las contraseñas deben almacenarse cifradas (hash con BCrypt).
- **RNF-02** La autenticación debe usar tokens JWT con expiración.
- **RNF-03** Los endpoints del panel deben estar protegidos según el rol y permisos del usuario.
- **RNF-04** Los endpoints públicos (cotizador, rastreador) no deben requerir autenticación.
- **RNF-05** El rastreador debe validar tracking + orden juntos para evitar acceso no autorizado a pedidos ajenos.

### Rendimiento

- **RNF-06** El cotizador debe recalcular el resultado en menos de 1 segundo ante cualquier cambio.
- **RNF-07** El sistema debe soportar el volumen de ~1,000 pedidos mensuales sin degradación.
- **RNF-08** El tipo de cambio debe cachearse para no consultar la API externa en cada cálculo.

### Usabilidad

- **RNF-09** El sistema debe ser web responsive y funcionar correctamente en celulares.
- **RNF-10** Toda la interfaz debe estar en español (Perú).
- **RNF-11** El cotizador debe ser simple e intuitivo: solo dos campos (valor y peso).

### Disponibilidad y mantenibilidad

- **RNF-12** El sistema debe estar disponible 24/7 con un objetivo de uptime del 99%.
- **RNF-13** La base de datos debe tener backups automáticos diarios (Supabase Pro).
- **RNF-14** El código debe estar organizado en módulos para facilitar el mantenimiento.

### Compatibilidad

- **RNF-15** El sistema debe funcionar en navegadores modernos (Chrome, Safari, Firefox, Edge).
- **RNF-16** El frontend debe ser compatible con dispositivos iOS y Android vía navegador.

---

## 2.3 Matriz de trazabilidad (resumen)

| Módulo | RF asociados | Documento de diseño |
|--------|--------------|---------------------|
| Autenticación y roles | RF-01 a RF-06 | [07 — Seguridad](07_security.md) |
| Registro de pedidos | RF-07 a RF-11 | [04 — BD](04_database.md), [05 — API](05_api_design.md) |
| Tablero de estados | RF-12 a RF-15 | [05 — API](05_api_design.md), [06 — UI](06_ui_design.md) |
| Finanzas | RF-16 a RF-20 | [05 — API](05_api_design.md) |
| Cotizador | RF-21 a RF-35 | [06 — UI](06_ui_design.md) |
| Rastreador | RF-36 a RF-40 | [06 — UI](06_ui_design.md) |

---

*Anterior: [01 — Descripción general](01_overview.md) · Siguiente: [03 — Arquitectura →](03_architecture.md)*
