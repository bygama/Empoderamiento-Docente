import type { Metadata } from "next";
import { draftMode } from "next/headers";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IndicePagina } from "@/components/layout/IndicePagina";
import { Analitica } from "@/components/layout/Analitica";
import { AterrizajePorLink } from "@/components/layout/AterrizajePorLink";
import { VisorVisual } from "@/components/layout/VisorVisual";
import { FranjaDeBorrador } from "@/components/layout/FranjaDeBorrador";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { inter, manrope } from "@/config/fuentes/compartidas";
import { caveat, courierPrime, jetbrainsMono } from "@/config/fuentes/del-sitio";
import { OPEN_GRAPH_COMUN, TITULO_DEL_SITIO } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import { datosDelSitio } from "@/datos/consultas/sitio";
import { aliadosDelSitio } from "@/datos/consultas/aliados";

const METADATA: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: TITULO_DEL_SITIO,
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
    ...OPEN_GRAPH_COMUN,
    title: TITULO_DEL_SITIO,
    description: siteConfig.description,
  },
};

/**
 * En Draft Mode el sitio manda `noindex`: un borrador no se indexa (SPEC §6).
 * Leer `draftMode()` acá no vuelve dinámicas las páginas: en el prerender
 * responde «apagado» y la metadata queda igual que antes.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  return isEnabled ? { ...METADATA, robots: { index: false, follow: false } } : METADATA;
}

/**
 * El pie y el menú del celular muestran los datos de Ajustes › Datos del
 * sitio y la tira de aliados (los publicados y autorizados): se leen acá, una
 * vez, y bajan por props. Guardar los datos o tocar un aliado revalida este
 * layout, y con él todas las páginas.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ correo, redes, paises }, aliados] = await Promise.all([datosDelSitio(), aliadosDelSitio()]);
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} ${caveat.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Solo se ve con la cookie de Draft Mode (vista previa del admin). */}
        <FranjaDeBorrador />
        <LenisProvider>
          {/* Para teclado y lectores de pantalla: saltear el header e ir al
              contenido. Invisible hasta que recibe el foco. */}
          <a
            href="#contenido"
            className="bg-azul-principal focus:outline-verde-concepto sr-only rounded-lg px-4 py-2 font-sans text-[0.95rem] font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:outline-2 focus:outline-offset-2"
          >
            Saltar al contenido
          </a>
          <Header sitio={{ correo, redes }} />
          <IndicePagina />
          <AterrizajePorLink />
          <VisorVisual />
          {children}
          {/* Fondo detrás del footer: la muesca de sus esquinas superiores
              redondeadas toma ESTE color. Blanco por defecto (matchea las
              páginas que terminan en blanco). Si la página termina sobre
              otro color, su última sección se marca con
              [data-footer-dock-tint="<color>"] y una regla de globals.css
              tiñe la muesca (gris, medio) o, en "propio", la vuelve
              transparente y sube el footer --footer-radio sobre el cierre
              para que el redondeo recorte la escena. */}
          <div data-footer-dock className="bg-white">
            <Footer sitio={{ redes, paises }} aliados={aliados} />
          </div>
        </LenisProvider>
        <Analitica />
      </body>
    </html>
  );
}
