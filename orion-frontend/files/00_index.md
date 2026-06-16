# 📦 Software Design Document (SDD) — Orión Logistic

> Sistema digital de gestión de importaciones · Courier y Carga Internacional
> **Orión Global Logistics S.A.C.** — Lima, Perú · 2025
> **Versión 2.0** — cotizador simplificado

---

## ¿Qué es este documento?

Este SDD describe **cómo está diseñado** el sistema de Orión Logistic antes de construirlo. Es la guía técnica que el equipo (Joaquín — Frontend, José — Backend) usará durante los 4 sprints del proyecto.

---

## 📑 Índice de documentos

| # | Documento | Responsable | Descripción |
|---|-----------|-------------|-------------|
| 00 | [Índice](00_index.md) | — | Mapa maestro, equipo, stack, convenciones |
| 01 | [Descripción general](01_overview.md) | Ambos | Propósito, usuarios, alcance, lógica de negocio |
| 02 | [Requerimientos](02_requirements.md) | Ambos | Requerimientos funcionales y no funcionales |
| 03 | [Arquitectura](03_architecture.md) | Ambos | Stack, monolito modular, estructura de carpetas |
| 04 | [Base de datos](04_database.md) | José | Modelo de datos, tablas y relaciones |
| 05 | [Diseño de la API](05_api_design.md) | José | Endpoints REST — contrato Front ↔ Back |
| 06 | [Diseño de interfaces](06_ui_design.md) | Joaquín | Design system, mapa de pantallas, flujos |
| 07 | [Seguridad y roles](07_security.md) | José | JWT, BCrypt, matriz de permisos |
| 08 | [Plan de sprints](08_sprints.md) | Ambos | Scrum, tareas, ceremonias |
| 08b | [Plan diario](08b_plan_diario.md) | Ambos | Desglose día por día de las 4 semanas |
| 09 | [Galería de prompts](09_galeria_prompts.md) | Joaquín | Prompts de Google Stitch por pantalla |
| 10 | [Scripts SQL Supabase](10_supabase_sql.md) | José | Scripts SQL — orden de ejecución en Supabase |

---

## 👥 Equipo

| Rol | Persona | Herramienta | Responsabilidad |
|-----|---------|-------------|-----------------|
| Frontend | **Joaquín** | VS Code | Next.js · Tailwind · shadcn/ui |
| Backend | **José** | IntelliJ IDEA | Java Spring Boot · PostgreSQL |

---

## 🛠️ Stack tecnológico (resumen)

- **Repositorios:** `orion-frontend` (Next.js) y `orion-backend` (Spring Boot) — dos repos separados en GitHub
- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui → Cloudflare Pages
- **Backend:** Java Spring Boot 3 + Spring Security + JWT → Railway
- **Base de datos:** PostgreSQL (Supabase Pro)
- **API tipo de cambio:** ExchangeRate-API (dólar en vivo)
- **Dominio:** orionlogisticperu.com

---

## 🎯 Resumen del sistema en una frase

> Dos aplicaciones web: un **panel de administración** donde el equipo gestiona pedidos, finanzas y tarifas; y una **app pública** donde los clientes cotizan envíos, rastrean sus pedidos y eligen cómo recibirlos.

---

## 💡 Lógica del cotizador (versión final simplificada)

El cotizador tiene **una sola regla**:

- **Valor menor a $200** → calcula: flete (peso redondeado hacia arriba × precio por kilo) + desaduanaje. Muestra el total en soles.
- **Valor mayor a $200** → no calcula. Invita amablemente al cliente a hablar con un asesor por WhatsApp.

El admin solo configura **dos valores**: el flete por kilo y el desaduanaje.

---

## 📌 Convenciones del documento

- **RF** = Requerimiento Funcional · **RNF** = Requerimiento No Funcional
- **Admin** = dueño del negocio (acceso total)
- **Empleado** = usuario con permisos limitados
- **Cliente** = comprador final (sin cuenta, solo consulta)
- Montos del negocio en **USD ($)**, conversión a soles con tipo de cambio en vivo

---

*Última actualización: 2025 · Versión 2.0 (cotizador simplificado)*
