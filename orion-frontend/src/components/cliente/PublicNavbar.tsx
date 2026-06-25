import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/** Navbar de las páginas públicas (landing, cotizador). */
export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-white/90 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:h-[72px]">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo-horizontal.svg"
            alt="Orión Logistic"
            width={280}
            height={73}
            className="h-10 w-auto sm:h-16"
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="whitespace-nowrap border border-primary sm:h-11 sm:px-5 sm:text-base">
            <Link href="/cotizar">Cotizar</Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="whitespace-nowrap sm:h-11 sm:px-5 sm:text-base">
            <Link href="/rastrear">Rastrear pedido</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
