import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";

// El layout raíz del admin. Es el SEGUNDO layout raíz de la app —el otro es el
// del sitio—, y por eso `app/(sitio)/[...resto]` sigue existiendo: con dos
// raíces, Next no tiene una 404 global.

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter", weight: ["400", "500", "600"] });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Empoderamiento Docente",
  // Cinturón y tiradores: el `X-Robots-Tag` del middleware es el que manda,
  // pero esto cubre el caso de que alguien sirva el HTML por otro camino.
  robots: { index: false, follow: false },
};

export default function LayoutDelAdmin({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full bg-gris-fondo text-azul-principal antialiased">{children}</body>
    </html>
  );
}
