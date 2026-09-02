import Image from "next/image";
import type { LaminaCaso as Lamina, TinteCarpeta } from "./data";
import { ROTULO_MICRO, TINTES } from "./tintes";
import { ClipPapel } from "./Garabatos";

type Props = {
  lamina: Lamina;
  tinte: TinteCarpeta;
  esDemo: boolean;
};

/** Cinta adhesiva translúcida (par superior, apenas rotada). */
function Cinta({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-azul-claro/45 absolute h-6 w-20 border border-white/60 shadow-sm ${className ?? ""}`}
    />
  );
}

/**
 * Lámina visual del expediente: la ilustración del caso montada como pieza
 * física — marco blanco fino con grano, sombra apoyada y un sistema de
 * sujeción distinto por caso (clip metálico / cintas / esquinas de álbum).
 * El wrapper exterior recibe el reveal por scroll; la figura interna,
 * el micro-parallax (nunca el mismo elemento para ambos).
 */
export function LaminaCaso({ lamina, tinte, esDemo }: Props) {
  const clases = TINTES[tinte];

  return (
    <figure
      data-pieza-parallax
      data-exp-asienta
      data-profundidad="7"
      className="relative rotate-[0.9deg] will-change-transform"
    >
      <div className="bg-grain-light relative rounded-md bg-white p-2.5 pb-3 shadow-[0_30px_60px_-28px_rgb(31_45_77/0.5)] ring-1 ring-azul-principal/10 lg:p-3.5 lg:pb-4">
        {/* priority: la lámina es la pieza protagonista del revelado; tiene
            que estar decodificada cuando el morph termina, no aparecer después. */}
        <Image
          src={lamina.src}
          alt={lamina.alt}
          width={1600}
          height={1200}
          sizes="(min-width: 1024px) 46rem, 90vw"
          priority
          className="relative w-full rounded-[3px]"
        />

        {lamina.sujecion === "esquinas" && (
          <>
            {[
              "top-1 left-1",
              "top-1 right-1 rotate-90",
              "bottom-2 right-1 rotate-180",
              "bottom-2 left-1 -rotate-90",
            ].map((pos) => (
              <span
                key={pos}
                aria-hidden="true"
                className={`absolute h-6 w-6 ${pos} ${clases.carpeta} opacity-80 shadow-sm`}
                style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
              />
            ))}
          </>
        )}
      </div>

      {lamina.sujecion === "clip" && (
        <ClipPapel className="text-gris-texto absolute -top-4 left-10 h-12 w-auto rotate-[5deg] drop-shadow-sm" />
      )}
      {lamina.sujecion === "cinta" && (
        <>
          <Cinta className="-top-2.5 left-8 -rotate-6" />
          <Cinta className="-top-2.5 right-8 rotate-[5deg]" />
        </>
      )}

      <figcaption
        className={`mt-3 flex items-baseline justify-between gap-4 ${ROTULO_MICRO} text-gris-texto`}
      >
        <span>{lamina.rotulo}</span>
        {esDemo && <span className="shrink-0">ILUSTRACIÓN DEMO</span>}
      </figcaption>
    </figure>
  );
}
