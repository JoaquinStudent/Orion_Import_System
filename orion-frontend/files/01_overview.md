# 01 — Descripción General del Sistema

> **SDD Orión Logistic** · Documento 1 de 9 · Versión 2.0
> Responsable: Ambos (Joaquín + José)

---

## 1.1 Propósito del sistema

Orión Logistic es una empresa peruana de importación y courier que trae productos desde Estados Unidos (Miami) hacia Perú, con un volumen aproximado de **1,000 pedidos mensuales**. La gestión manual actual (correos, hojas de cálculo, WhatsApp) genera demoras, errores y poca trazabilidad. El sistema digitaliza todo el flujo con **dos aplicaciones web** que trabajan juntas: una para el equipo interno y otra para los clientes.

---

## 1.2 Objetivos

**Objetivo general**
Centralizar y digitalizar el flujo de importación de Orión Logistic en una plataforma web, desde el registro del pedido hasta su entrega, con un cotizador y rastreador público para los clientes.

**Objetivos específicos**

1. Registrar y gestionar pedidos con toda su información en un solo lugar.
2. Permitir el seguimiento del estado de cada pedido en tiempo real.
3. Ofrecer un cotizador público simple para envíos menores a $200.
4. Derivar los envíos mayores a $200 a atención personalizada por WhatsApp.
5. Llevar el control de ingresos del negocio en dólares con reportes exportables.
6. Dar al cliente autonomía para cotizar, rastrear y elegir su tipo de envío.

---

## 1.3 Usuarios del sistema

**Administrador (dueño)**
Acceso total. Gestiona pedidos, finanzas, configura el cotizador (flete y desaduanaje), crea empleados con permisos y define el WhatsApp de atención. En el sistema es "Joaquín".

**Empleado**
Permisos limitados definidos por el administrador. Típicamente registra pedidos y cambia estados, pero no accede a finanzas ni configuración salvo permiso explícito. En el sistema es "José".

**Cliente**
Comprador final. Sin cuenta ni registro. Usa el cotizador público, rastrea su pedido con tracking + orden, y elige cómo recibirlo. Interacción de solo lectura, excepto la selección del tipo de envío.

---

## 1.4 Alcance del proyecto

### Lo que el sistema SÍ incluye

El panel de administración cubre el registro de pedidos, un tablero visual de estados personalizables, un módulo de finanzas con exportación a Excel, la configuración del cotizador (flete por kilo y desaduanaje) y la gestión de usuarios y roles.

La aplicación del cliente incluye una landing page, un cotizador público simple, un rastreador de pedidos y un selector de tipo de envío.

Ambas comparten base de datos y se integran con una API de tipo de cambio y con WhatsApp como canal de contacto.

### Lo que el sistema NO incluye (fuera de alcance)

No contempla por ahora: pasarela de pagos en línea, integración automática con couriers de EE.UU, app móvil nativa (es web responsive), facturación electrónica SUNAT, ni notificaciones automáticas push o por correo. La comunicación con el cliente se hace manualmente vía WhatsApp.

---

## 1.5 Restricciones

Plazo fijo de **4 semanas** con un equipo de **2 personas** bajo Scrum con sprints semanales. Infraestructura optimizada para Cloudflare (gratis), Supabase Pro y Railway. El sistema debe ser **web responsive** y funcionar correctamente en celulares.

---

## 1.6 Supuestos

Se asume que: el cotizador maneja la regla simple de $200 como umbral; el tipo de cambio se obtiene de una API externa confiable; el cliente conoce su tracking y orden para rastrear; y el equipo gestiona las direcciones de almacén de forma privada, compartiéndolas por WhatsApp y no publicándolas en la web.

---

## 1.7 Lógica de negocio clave — El cotizador

El corazón del sistema es el **cálculo del costo de envío**. La lógica final es deliberadamente simple:

### Caso 1 — Valor menor a $200 (Embarque)

El sistema calcula el costo:

1. El cliente ingresa el **valor del producto en USD** y el **peso en kg**.
2. El peso se **redondea hacia arriba** al siguiente entero (1.3 kg → 2 kg).
3. **Flete** = peso redondeado × precio por kilo (configurado por el admin).
4. Se suma el **desaduanaje** (valor fijo configurado por el admin).
5. **Total en dólares** = flete + desaduanaje.
6. Se convierte a soles con el tipo de cambio en vivo.

**Ejemplo:** producto de $20, peso 1.3 kg → redondea a 2 kg → flete 2 × $10 = $20 + desaduanaje $9 = **$29** → × S/ 3.40 = **S/ 98.60**.

### Caso 2 — Valor mayor a $200 (Asesor)

El cotizador no calcula. Muestra una invitación amigable para hablar con un asesor por WhatsApp, ya que estos envíos tienen un proceso especial (pueden requerir permisos).

> El admin solo configura dos valores: **flete por kilo** y **desaduanaje**. Nada más.

---

*Siguiente documento: [02 — Requerimientos →](02_requirements.md)*
