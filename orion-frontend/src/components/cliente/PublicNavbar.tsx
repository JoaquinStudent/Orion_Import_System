import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Navbar de las páginas públicas (landing, cotizador). */
export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-white/90 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold">
            <span className="text-primary">Orión</span>{" "}
            <span className="text-gold">Logistic</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/cotizar">Cotizar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/login">Acceso al panel</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
