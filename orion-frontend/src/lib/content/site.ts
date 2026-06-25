/**
 * Contenido del sitio público (cara al cliente).
 *
 * ⚠️ TODO ES DATA FICTICIA / DE EJEMPLO. Reemplazar con la info real que entregue
 * el cliente — ver `SOLICITUD_CLIENTE.md` en la raíz de orion-frontend.
 * Centralizado acá a propósito: cuando llegue el contenido real, se edita SOLO este archivo.
 */

/** Datos de la empresa (footer, contacto, legales). */
export const EMPRESA = {
  razonSocial: "Orión Global Logistics S.A.C.",
  ruc: "20XXXXXXXXX", // PENDIENTE: RUC real
  email: "contacto@orionlogistic.com", // PENDIENTE: confirmar
  horarios: "Lunes a sábado · 9:00 a 18:00", // PENDIENTE
  ciudad: "Lima, Perú",
  origen: "Miami, Florida (EE.UU.)",
  // PENDIENTE: links reales (dejar "" para ocultar)
  redes: {
    instagram: "https://instagram.com/orionlogistic",
    facebook: "https://facebook.com/orionlogistic",
    tiktok: "",
  },
  // PENDIENTE: URL del formulario oficial del Libro de Reclamaciones (Indecopi)
  libroReclamacionesUrl: "",
};

/** Testimonios de clientes. FICTICIO — reemplazar por reseñas reales (con permiso). */
export const TESTIMONIOS = [
  {
    nombre: "María Fernández",
    ciudad: "Lima",
    estrellas: 5,
    texto:
      "Compré una laptop en Amazon y llegó en 8 días, perfecta. El rastreo me avisaba en cada etapa. Súper recomendados.",
  },
  {
    nombre: "Carlos Quispe",
    ciudad: "Arequipa",
    estrellas: 5,
    texto:
      "Vivo en provincia y me lo enviaron por Shalom sin problemas. La cotización fue clara y sin sorpresas en el precio.",
  },
  {
    nombre: "Lucía Ramírez",
    ciudad: "Trujillo",
    estrellas: 5,
    texto:
      "Atención por WhatsApp impecable. Me ayudaron con un envío grande y me asesoraron en todo el proceso de aduana.",
  },
];

/** Preguntas frecuentes. FICTICIO/genérico — validar respuestas con el cliente. */
export const FAQ = [
  {
    q: "¿Cómo obtengo la dirección del almacén en Miami?",
    a: "Al registrar tu pedido te compartimos por WhatsApp la dirección de nuestro almacén en Miami para que la uses al comprar en EE.UU.",
  },
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "El tiempo estimado es de 6 a 12 días desde que recibimos el paquete en Miami hasta que llega a Perú, según el tipo de envío y la gestión de aduana.",
  },
  {
    q: "¿Quién paga los impuestos de aduana?",
    a: "Los tributos de importación, cuando corresponden, los asume el cliente. Para envíos mayores a $200 te asesoramos personalmente con el cálculo exacto.",
  },
  {
    q: "¿Qué pasa si mi compra supera los $200?",
    a: "Te derivamos a un asesor por WhatsApp para darte un precio exacto y acompañarte en el proceso. No es un error: es atención personalizada para envíos más grandes.",
  },
  {
    q: "¿Cómo rastreo mi pedido?",
    a: "Con tu número de tracking y de orden podés ver el estado en tiempo real desde la sección Rastrear, en cada etapa del proceso.",
  },
  {
    q: "¿Cómo recibo mi paquete en Perú?",
    a: "Podés retirarlo en nuestro almacén, recibirlo por delivery en Lima, o por envío a provincia mediante Shalom. Vos elegís al momento de la entrega.",
  },
];

/** Productos prohibidos / restringidos. FICTICIO/genérico — validar con el cliente y aduanas. */
export const PRODUCTOS_PROHIBIDOS = [
  "Armas, municiones y réplicas",
  "Sustancias inflamables, explosivas o corrosivas",
  "Baterías de litio sueltas (fuera del equipo)",
  "Líquidos, aerosoles y perfumes restringidos",
  "Productos perecederos o alimentos frescos",
  "Dinero en efectivo, joyas y valores",
  "Medicamentos sin registro ni receta",
  "Réplicas y productos falsificados",
];

/** Cobertura de entrega. FICTICIO — confirmar zonas/condiciones con el cliente. */
export const COBERTURA = [
  { zona: "Retiro en almacén", detalle: "Recogé tu paquete en nuestro almacén en Lima, sin costo de delivery." },
  { zona: "Delivery en Lima", detalle: "Te lo llevamos a tu domicilio dentro de Lima Metropolitana." },
  { zona: "Provincias", detalle: "Cobertura a nivel nacional mediante la agencia Shalom." },
];

/** Sección Nosotros. FICTICIO — reemplazar con la historia y valores reales. */
export const NOSOTROS = {
  intro:
    "Orión Logistic nace para que importar desde Estados Unidos sea simple, transparente y confiable. Operamos desde Miami hacia todo el Perú, con tecnología que te deja ver tu pedido en cada paso.",
  mision:
    "Conectar a las personas con los productos que quieren del exterior, brindando un servicio de importación ágil, seguro y sin letra chica.",
  vision:
    "Ser el courier de importación de referencia en el Perú por confianza, trazabilidad y cercanía con cada cliente.",
  valores: [
    { titulo: "Transparencia", texto: "Precios claros y seguimiento en tiempo real, sin sorpresas." },
    { titulo: "Confianza", texto: "Cuidamos cada paquete como si fuera nuestro." },
    { titulo: "Cercanía", texto: "Atención personalizada por WhatsApp cuando la necesités." },
  ],
};
