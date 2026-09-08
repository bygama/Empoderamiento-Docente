import type { Metadata } from "next";
import { Caveat, Courier_Prime, Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IndicePagina } from "@/components/layout/IndicePagina";
import { AterrizajePorLink } from "@/components/layout/AterrizajePorLink";
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
  description: siteConfig.description,
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
    description: siteConfig.description,
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
          {/* Para teclado y lectores de pantalla: saltear el header e ir al
              contenido. Invisible hasta que recibe el foco. */}
          <a
            href="#contenido"
            className="bg-azul-principal focus:outline-verde-concepto sr-only rounded-lg px-4 py-2 font-sans text-[0.95rem] font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:outline-2 focus:outline-offset-2"
          >
            Saltar al contenido
          </a>
          <Header />
          <IndicePagina />
          <AterrizajePorLink />
          {children}
          {/* Fondo detrás del footer: la muesca de sus esquinas superiores
              redondeadas toma ESTE color. Blanco por defecto (matchea las
              páginas que terminan en blanco). Si la página termina sobre
              otro color, su última sección se marca con
              [data-footer-dock-tint="<color>"] y una regla de globals.css
              tiñe la muesca (gris, medio) o, en "noche", la vuelve
              transparente y sube el footer --footer-radio sobre el cierre
              para que el redondeo recorte la escena. */}
          <div data-footer-dock className="bg-white">
            <Footer />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
