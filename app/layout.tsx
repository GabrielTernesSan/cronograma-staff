import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cronograma 30 meses — .NET / Arquitetura / Staff",
  description:
    "Plano de set/2026 a fev/2029: 7 blocos de arquitetura aplicada, com etapas de projeto, medições registradas e os marcos de trabalho, Azure e inglês.",
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
