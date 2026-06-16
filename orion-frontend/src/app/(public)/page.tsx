import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Landing placeholder (Sprint 1). La landing real se construye en el Sprint 3.
 */
export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-muted">
          Orión Logistic
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl">
          Importamos desde EE.UU. hasta tu puerta
        </h1>
        <p className="mx-auto max-w-md text-on-surface-variant">
          Plataforma en construcción. Las secciones públicas (cotizador y
          rastreador) estarán disponibles próximamente.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/admin/login">Acceso al panel</Link>
        </Button>
      </div>
    </main>
  );
}
