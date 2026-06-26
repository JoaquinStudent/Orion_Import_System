import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MapPin, Plane, Mail, Clock } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { EMPRESA } from "@/lib/content/site";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? "+51999999999";

const SERVICIOS = [
  { href: "/cotizar", label: "Cotizá tu envío" },
  { href: "/rastrear", label: "Rastreá tu pedido" },
  { href: "/productos-prohibidos", label: "Productos prohibidos" },
];

const EMPRESA_LINKS = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#cobertura", label: "Cobertura" },
];

const LEGALES = [
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/libro-reclamaciones", label: "Libro de Reclamaciones" },
];

const CONTACTO = [
  { icon: Plane, texto: `Importamos desde ${EMPRESA.origen}` },
  { icon: MapPin, texto: EMPRESA.ciudad },
  { icon: Clock, texto: EMPRESA.horarios },
  { icon: Mail, texto: EMPRESA.email },
];

/** Footer de las páginas públicas. */
export function PublicFooter() {
  return (
    <footer className="mt-16 bg-navy-dark text-white">
      <div className="container mx-auto grid gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Marca + contacto */}
        <div className="space-y-5 sm:col-span-2">
          <Image
            src="/logo-horizontal-white.svg"
            alt="Orión Logistic"
            width={200}
            height={52}
            className="h-12 w-auto"
          />
          <p className="max-w-xs text-sm leading-relaxed text-navy-soft">
            Importamos desde Estados Unidos hasta tu puerta, con seguimiento de punta a punta.
          </p>
          <ul className="space-y-2 text-sm text-navy-soft">
            {CONTACTO.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.texto} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-gold" />
                  {c.texto}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={whatsappLink(WA, "Hola, quiero consultar por una importación.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2 text-sm font-medium text-white hover:bg-whatsapp-dark"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            {EMPRESA.redes.instagram && (
              <a href={EMPRESA.redes.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-soft transition-colors hover:text-gold">
                Instagram
              </a>
            )}
            {EMPRESA.redes.facebook && (
              <a href={EMPRESA.redes.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-soft transition-colors hover:text-gold">
                Facebook
              </a>
            )}
          </div>
        </div>

        <FooterCol titulo="Servicios" links={SERVICIOS} />
        <FooterCol titulo="Empresa" links={EMPRESA_LINKS} />
        <FooterCol titulo="Legal" links={LEGALES} />
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-navy-soft">
          © {new Date().getFullYear()} {EMPRESA.razonSocial} · RUC {EMPRESA.ruc} — Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ titulo, links }: { titulo: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-gold">{titulo}</h3>
      <ul className="space-y-2.5 text-sm text-navy-soft">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
