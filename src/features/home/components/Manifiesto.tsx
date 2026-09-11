/**
 * Panel "¿Quiénes somos?": TÍTULO de sección + cuerpo OFICIAL del cliente
 * (VERBATIM) a la IZQUIERDA y una imagen a la DERECHA [[ed-copy-oficial]]. El
 * título da la jerarquía; el cuerpo (más chico) se rellena con el scroll. La
 * Misión es el espejo (texto derecha / imagen izquierda). El barrido verde lo
 * "borra" y revela la Misión en el mismo lugar — lo orquesta HeroQuienes.
 * Debajo del cuerpo, la salida a Quiénes somos: cada bloque del inicio tiene
 * una sola salida, hacia la página que lo amplía (Gastón, 2026-09-11).
 * NO parafrasear. Respeta prefers-reduced-motion (capas apiladas, sin animación).
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { ScrollFillText, type FillSeg } from "./ScrollFillText";

// Acentos en AZUL: conceptos clave; el resto se rellena en verde. Copy del
// cliente condensado a ~la mitad [[ed-copy-oficial]].
const QS_PARAGRAPHS: FillSeg[][] = [
  [
    { t: "Somos una manera distinta de comprender" },
    {
      t: "las matemáticas, la educación y el desarrollo profesional docente.",
      accent: true,
    },
    { t: "Una convicción hecha acción." },
  ],
  [
    {
      t: "Partimos de lo construido para seguir construyendo, junto a las comunidades educativas. Empoderamiento Docente",
    },
    { t: "instituye lo instituido:", accent: true },
    {
      t: "parte de los saberes existentes y los resignifica, desde la experiencia compartida, en",
    },
    {
      t: "nuevos modos de comprender, enseñar y construir conocimiento.",
      accent: true,
    },
  ],
];

export function Manifiesto() {
  return (
    <section
      className="relative flex h-full w-full items-center overflow-hidden py-8 md:py-16 motion-reduce:h-auto motion-reduce:py-24"
      aria-label="Quiénes somos"
    >
      <div
        data-wipe-bounds
        className="mx-auto grid w-full max-w-[88rem] grid-cols-1 items-start gap-6 px-5 md:px-10 lg:grid-cols-2 lg:gap-16"
      >
        {/* Texto (izquierda) — TÍTULO arriba + cuerpo debajo, centrados al medio
            del alto de la foto: la columna se estira al alto de la fila. */}
        <div className="relative flex flex-col justify-center self-stretch gap-5 text-left md:gap-6">
          <div>
            <span
              aria-hidden="true"
              className="bg-verde-concepto mb-4 block h-px w-10"
            />
            <h2 className="font-display text-azul-principal font-bold leading-[1.04] tracking-[-0.02em] [font-size:clamp(2rem,3.2vw,3.1rem)]">
              ¿Quiénes somos?
            </h2>
          </div>

          {/* Cuerpo (verbatim) — se rellena con el scroll: verde base, acentos
              en azul (ver QS_PARAGRAPHS). */}
          <ScrollFillText
            paragraphs={QS_PARAGRAPHS}
            className="font-sans text-verde-concepto font-medium leading-relaxed [font-size:clamp(0.92rem,1.1vw,1.15rem)]"
          />

          <Link
            href="/quienes-somos"
            className="group focus-visible:outline-naranja-accion mt-2 inline-flex w-fit items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="border-azul-principal/15 text-azul-principal group-hover:border-naranja-accion group-hover:bg-naranja-accion inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 group-hover:text-white">
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
            <span className="text-azul-principal group-hover:text-naranja-accion font-sans text-[0.9rem] font-medium tracking-wide transition-colors duration-500">
              Conocé al equipo
            </span>
          </Link>
        </div>

        {/* Imagen (derecha) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(15,32,64,0.4)] lg:aspect-[5/4]">
          <Image
            src="/hero/hero-3.webp"
            alt="Equipo de Empoderamiento Docente en un encuentro de trabajo"
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
