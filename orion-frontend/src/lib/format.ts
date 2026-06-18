/** Formateo de montos en USD (todos los importes del sistema son en dólares). */
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUSD(monto: number): string {
  return usdFormatter.format(monto);
}

/** Fecha legible en español (ej: "13 jun 2026"). */
export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Construye el link de WhatsApp a partir de un número (con o sin '+'). */
export function whatsappLink(numero: string, mensaje?: string): string {
  const limpio = numero.replace(/[^\d]/g, "");
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${limpio}${texto}`;
}
