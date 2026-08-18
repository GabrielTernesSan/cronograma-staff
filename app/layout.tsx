import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cronograma 24 meses — .NET / Arquitetura / Staff",
  description:
    "Plano de set/2026 a ago/2028: curso .NET Web API Zero to Hero completo, arquitetura, Azure e inglês — com progresso marcável.",
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
