import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/** Navbar de las páginas públicas (landing, cotizador). */
export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-white/90 backdrop-blur">
      <nav className="container mx-auto flex h-[72px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-horizontal.svg"
            alt="Orión Logistic"
            width={280}
            height={73}
            className="h-16 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="lg" className="text-base">
            <Link href="/cotizar">Cotizar</Link>
          </Button>
          <Button asChild size="lg" className="text-base">
            <Link href="/rastrear">Rastrear pedido</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
