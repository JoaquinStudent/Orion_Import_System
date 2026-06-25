# Información a solicitar al cliente — Landing pública Orión Logistic

> La landing y las páginas públicas ya están construidas y funcionando con **datos de ejemplo
> (ficticios)**. Para publicarla en serio, necesitamos que la empresa entregue la info real de abajo.
> **Casi todo se carga editando un solo archivo:** `src/lib/content/site.ts` (más algunos legales).
> Marcá/llená cada punto y nos lo pasás; nosotros lo reemplazamos.

---

## 1. Datos de la empresa (obligatorio) → `site.ts` › `EMPRESA`
- [ ] **Razón social** exacta (hoy: "Orión Global Logistics S.A.C.").
- [ ] **RUC** (hoy es un placeholder `20XXXXXXXXX`). Aparece en el footer.
- [ ] **Email de contacto** público (hoy `contacto@orionlogistic.com`).
- [ ] **Horarios de atención** (hoy "Lunes a sábado · 9:00 a 18:00").
- [ ] **Ciudad / país** (hoy "Lima, Perú") y **origen** (hoy "Miami, Florida (EE.UU.)").
- [ ] **Redes sociales** (URLs de Instagram / Facebook / TikTok). Si no hay, se ocultan solas.
- [ ] **Número de WhatsApp** real de atención (hoy se toma de la variable `NEXT_PUBLIC_WA_NUMBER`
      y también se configura desde el panel admin → Configuración).

## 2. Legal — OBLIGATORIO en Perú (alta prioridad)
Son páginas que ya existen con texto de ejemplo; hay que reemplazarlas por el texto legal real:
- [ ] **Términos y Condiciones** del servicio → página `/terminos`.
- [ ] **Política de Privacidad** (Ley N.º 29733 de Protección de Datos Personales) → `/privacidad`.
- [ ] **Libro de Reclamaciones** (exigido por Indecopi) → `/libro-reclamaciones`.
      Necesitamos **la URL del formulario oficial** o el proveedor que usen para integrarlo.
> Recomendación: estos textos los debería redactar/validar un abogado o contador de la empresa.

## 3. Confianza / prueba social → `site.ts` › `TESTIMONIOS`
- [ ] **Testimonios reales** de clientes (nombre, ciudad, comentario y, si se puede, autorización
      para publicarlo). Hoy hay 3 ficticios. Ideal 3 a 6.
- [ ] (Opcional) ¿Tienen perfil con **reseñas en Google/Facebook**? Pasar el link/calificación.
- [ ] (Opcional) **Logos de aliados** (Shalom u otros) si quieren mostrar "trabajamos con".

## 4. Preguntas frecuentes → `site.ts` › `FAQ`
- [ ] **Validar/corregir las respuestas** de las 6 FAQ (hoy son genéricas). En especial:
  - ¿Quién paga los **impuestos/aranceles de aduana** y cómo se calculan?
  - **Tiempos** reales de entrega.
  - Cómo se entrega la **dirección del almacén de Miami**.
  - Qué pasa con envíos **> $200**.
- [ ] Agregar cualquier pregunta frecuente propia del negocio que falte.

## 5. Productos prohibidos / restringidos → `site.ts` › `PRODUCTOS_PROHIBIDOS`
- [ ] **Confirmar la lista** real de lo que NO transportan (hoy es una lista genérica de ejemplo).
      Importante que coincida con la normativa aduanera y su política interna.

## 6. Cobertura → `site.ts` › `COBERTURA`
- [ ] Confirmar **zonas y condiciones** de entrega (hoy: retiro en almacén, delivery Lima, provincias
      por Shalom). ¿Hay costos/restricciones por zona? ¿Otras agencias además de Shalom?

## 7. Nosotros → `site.ts` › `NOSOTROS`
- [ ] **Historia breve / descripción** real de la empresa (hoy ficticia).
- [ ] **Misión, visión y valores** reales (hoy de ejemplo).
- [ ] (Opcional) Año de fundación, hitos, equipo.

## 8. Marca / assets
- [ ] **Logos definitivos** (ya tenés el sistema cableado): `public/logo-icon.svg`,
      `logo-horizontal.svg`, `logo.svg`, y las versiones blancas `logo-horizontal-white.svg`,
      `logo-white.svg`. Si cambian, se reemplazan con esos mismos nombres.
- [ ] (Opcional) Una **imagen/ilustración** para compartir en redes (OpenGraph) — hoy usa el logo.

## 9. Pricing (si quieren mostrarlo)
- [ ] El cotizador ya calcula con flete/kg + desaduanaje (configurable en el panel). ¿Quieren mostrar
      una **tarifa de referencia** o un ejemplo de cotización en la landing?

---

### Dónde se reemplaza cada cosa (resumen técnico)
| Sección | Archivo |
|---|---|
| Empresa, testimonios, FAQ, prohibidos, cobertura, nosotros | `src/lib/content/site.ts` |
| Términos / Privacidad / Libro de Reclamaciones | `src/app/(public)/terminos|privacidad|libro-reclamaciones/page.tsx` |
| WhatsApp | variable `NEXT_PUBLIC_API`/`NEXT_PUBLIC_WA_NUMBER` + panel admin |
| Logos | carpeta `public/` (mismos nombres de archivo) |

Cuando nos pases esta info, la cargamos y la landing queda lista para producción.
