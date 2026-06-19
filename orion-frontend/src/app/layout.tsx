import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { MswProvider } from "@/components/providers/MswProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Orión Logistic — Importaciones desde EE.UU.",
  description:
    "Sistema de gestión de importaciones y courier internacional de Orión Logistic.",
  icons: { icon: "/logo-icon.svg" },
  openGraph: {
    title: "Orión Logistic — Importaciones desde EE.UU.",
    description:
      "Importamos tus compras de Estados Unidos hasta tu puerta, con seguimiento en cada etapa.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <MswProvider>{children}</MswProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
