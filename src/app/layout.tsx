import type { Metadata } from "next";
import { Caveat, Courier_Prime, Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

// Manuscrita — SOLO para anotaciones "a mano" dentro de los expedientes de
// Investigación (notas al margen, marcas humanas). No es tipografía de UI.
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
  weight: ["500", "600"],
});

// Maquina de escribir — SOLO para el texto documental de los expedientes de
// Investigacion (informes mecanografiados del archivo). No es tipografia de UI.
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-courier-prime",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default:
      "Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas",
    template: "%s | Empoderamiento Docente",
  },
  description:
    "Consultora en educación especializada en Matemáticas. Acompañamos a equipos docentes con investigación, formación y acompañamiento situado.",
  keywords: [
    "aprendizaje de las matemáticas",
    "desarrollo profesional docente",
    "matemática educativa",
    "consultora educativa",
    "formación docente",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    title:
      "Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas",
    description:
      "Consultora en educación especializada en Matemáticas. Investigación, formación y acompañamiento para equipos docentes.",
    siteName: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} ${caveat.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LenisProvider>
          <Header />
          {children}
          {/* Fondo detrás del footer: la muesca de sus esquinas superiores
              redondeadas toma ESTE color. Blanco por defecto (matchea las
              páginas que terminan en blanco). Si la página termina sobre
              gris-fondo —el cierre de Novedades—, esa sección se marca con
              [data-footer-dock-tint="gris"] y la muesca toma ese gris (regla en
              globals.css) para que el encuentro no muestre triángulos blancos. */}
          <div data-footer-dock className="bg-white">
            <Footer />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
