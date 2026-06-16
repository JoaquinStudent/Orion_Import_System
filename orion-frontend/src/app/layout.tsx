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
  title: "Orión Logistic — Importaciones desde EE.UU.",
  description:
    "Sistema de gestión de importaciones y courier internacional de Orión Logistic.",
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
