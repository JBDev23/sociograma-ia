// app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";

// Configuramos DM Sans (nuestra fuente Sans principal)
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans", // Definimos la variable CSS
});

// Configuramos Space Mono (nuestra fuente Mono para datos técnicos)
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono", // Definimos la variable CSS
});

export const metadata: Metadata = {
  title: "Classroom Designer Pro",
  description: "Gestión inteligente de espacios educativos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${spaceMono.variable}`}>
      <body className="bg-brand-cream/30 min-h-screen flex flex-col font-sans">
        <GlobalHeader />
        
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}