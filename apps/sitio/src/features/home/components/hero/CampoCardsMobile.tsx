import Image from "next/image";
import type { Hero } from "@/features/home/contenido/hero";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { GEOMETRIA_MOBILE } from "./geometria-hero";

/**
 * Campo CURADO para mobile/tablet (< lg): pocas fotos clave, ENTERAS dentro de
 * la pantalla (no asoman cortadas). DOS CAPAS para tener la MISMA animación de
 * deploy que el desktop SIN el bug de transforms:
 *  · SLOT (el div exterior): posición + centrado por CSS `translate(-50%,-50%)`.
 *    GSAP NUNCA lo toca → la foto queda exacta en su cx/cy.
 *  · ANIM ([data-mcard]): GSAP la anima con x/y/scale PURO (stack→deploy), sin
 *    transform inline de React → sin conflicto ni doble-centrado.
 * Ancho clampeado (no se dispara en tablet) y cx hacia adentro (25/75) para que
 * cada foto entre completa. Las fotos llegan por props, en el orden de la
 * geometría.
 */
export function CampoCardsMobile({ tarjetas }: { tarjetas: Hero["tarjetasCelular"] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 block lg:hidden"
    >
      {GEOMETRIA_MOBILE.map((c, i) => {
        const tarjeta = tarjetas[i];
        if (!tarjeta) return null;
        return (
          <div
            key={`m${i}`}
            className="absolute"
            style={{
              left: `${c.cx}%`,
              top: `${c.cy}svh`,
              width: `clamp(6rem, ${c.w}vw, 16rem)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div data-mcard>
              <div
                className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
                style={{ aspectRatio: c.ar }}
              >
                <Image
                  src={tarjeta.foto.src}
                  alt={tarjeta.foto.alt}
                  fill
                  sizes="45vw"
                  className="object-cover"
                  style={estiloDeFoco(tarjeta.foto.foco)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
