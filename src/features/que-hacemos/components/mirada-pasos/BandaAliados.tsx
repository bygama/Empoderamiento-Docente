import Image from "next/image";
import type { CSSProperties } from "react";
import { ALIADOS } from "@/config/aliados";
import { ALTO_PILA_REM } from "./PanelMirada";

/**
 * «Nos acompañan», la banda que cierra «Cómo trabajamos».
 *
 * LA BANDA SE COME LA PILA, TÍTULO INCLUIDO (el usuario, 2026-09-11, con una
 * referencia en video donde la última tarjeta sube por encima de toda la
 * pila y la tapa; y después: que no quede rastro de lo comido, que se coma
 * el título también, y que detrás venga lo demás). En desktop la banda
 * retrocede, con un margen negativo, el alto entero de la pila trabada: su
 * lugar natural queda dentro del colchón de la lista, y mientras la pila
 * está trabada sube en flujo desde el pie del viewport y llega a la altura
 * de la franja justo cuando el fondo de la lista empieza a empujar. De ahí
 * en adelante se van todos juntos. Sin sticky ni JS.
 *
 * Que no quede rastro lo resuelve el orden de pintado, no un velo: la banda
 * es `relative` y viene después de las cards, así que pinta por encima de
 * ellas y de la franja, y «Áreas», que viene pegada detrás (por eso el
 * cuerpo de la sección no lleva padding inferior en desktop), pinta por
 * encima de la sección entera (z-30 contra z-20, ver AreasQueHacemos) y su
 * blanco tapa lo que queda debajo. Nada de envoltorio blanco alrededor de
 * la banda: asomaba en las esquinas redondeadas y por los bordes sobre las
 * cards. Solo hay blanco detrás de la MITAD DE ABAJO, porque por las
 * esquinas inferiores asomaba la card de abajo y ese blanco se continúa con
 * el de «Áreas»; las esquinas de arriba muestran la pila, como las solapas.
 *
 * Los logos son los autorizados de config/aliados (AGENTS §5.4): los mismos
 * que ya publican el pie y la home, con el mismo filtro que los pinta de
 * blanco sobre navy.
 */
export function BandaAliados() {
  return (
    <div
      data-mirada-banda
      style={{ "--pila": `${ALTO_PILA_REM}rem` } as CSSProperties}
      className="mt-14 lg:relative lg:-mt-[var(--pila)]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 bottom-0 hidden bg-white lg:block"
      />
      <div className="bg-azul-principal relative rounded-[1.75rem] px-6 py-8 md:px-12">
        <p className="text-azul-claro/80 text-center font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
          Nos acompañan
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 md:gap-x-16">
          {ALIADOS.map((a) => (
            <li key={a.src} className="flex h-10 items-center">
              {/* El alto lo manda la clase y el ancho va `auto`: las medidas
                  del archivo (config/aliados) solo reservan la proporción. */}
              <Image
                src={a.src}
                alt={a.alt}
                width={a.w}
                height={a.h}
                unoptimized={"vectorial" in a}
                draggable={false}
                className={`${a.alto.pie} w-auto opacity-75 [filter:brightness(0)_invert(1)]`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
