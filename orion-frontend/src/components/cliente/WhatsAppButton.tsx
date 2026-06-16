"use client";

import { MessageCircle } from "lucide-react";

/** Número en formato wa.me (sin +, espacios ni guiones). */
function toWaLink(numero: string, mensaje?: string): string {
  const clean = numero.replace(/[^\d]/g, "");
  const text = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${clean}${text}`;
}

/**
 * Botón flotante de WhatsApp, fijo en todas las páginas públicas (SDD RF-27).
 * El número se lee de NEXT_PUBLIC_WA_NUMBER (en sprints siguientes vendrá de
 * GET /config/publica).
 */
export function WhatsAppButton({
  numero = process.env.NEXT_PUBLIC_WA_NUMBER ?? "+51999999999",
  mensaje = "Hola, quiero más información sobre mis importaciones.",
}: {
  numero?: string;
  mensaje?: string;
}) {
  return (
    <a
      href={toWaLink(numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 hover:bg-whatsapp-dark"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
