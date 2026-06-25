import type { Metadata } from "next";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";
import { DocPage } from "@/components/cliente/DocPage";
import { Card, CardContent } from "@/components/ui/card";
import { NOSOTROS } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Nosotros — Orión Logistic",
  description:
    "Importamos desde Estados Unidos hacia todo el Perú con tecnología, transparencia y atención personalizada.",
};

const VALOR_ICONS = [ShieldCheck, Heart, Sparkles];

export default function NosotrosPage() {
  return (
    <DocPage titulo="Nosotros" descripcion={NOSOTROS.intro}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-2 text-base font-semibold text-primary">Nuestra misión</h2>
            <p className="text-sm">{NOSOTROS.mision}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-2 text-base font-semibold text-primary">Nuestra visión</h2>
            <p className="text-sm">{NOSOTROS.vision}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-primary">Nuestros valores</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {NOSOTROS.valores.map((v, i) => {
            const Icon = VALOR_ICONS[i] ?? ShieldCheck;
            return (
              <Card key={v.titulo} className="h-full">
                <CardContent className="flex h-full flex-col items-start gap-2 pt-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{v.titulo}</h3>
                  <p className="text-sm">{v.texto}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DocPage>
  );
}
