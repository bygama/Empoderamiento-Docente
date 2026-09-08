import Image from "next/image";
import { MOBILE_CARDS } from "./hero-cards";

/**
 * Campo CURADO para mobile/tablet (< lg): pocas fotos clave, ENTERAS dentro de
 * la pantalla (no asoman cortadas). DOS CAPAS para tener la MISMA animación de
 * deploy que el desktop SIN el bug de transforms:
 *  · SLOT (el div exterior): posición + centrado por CSS `translate(-50%,-50%)`.
 *    GSAP NUNCA lo toca → la foto queda exacta en su cx/cy.
 *  · ANIM ([data-mcard]): GSAP la anima con x/y/scale PURO (stack→deploy), sin
 *    transform inline de React → sin conflicto ni doble-centrado.
 * Ancho clampeado (no se dispara en tablet) y cx hacia adentro (25/75) para que
 * cada foto entre completa.
 */
export function CampoCardsMobile() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 block lg:hidden"
    >
      {MOBILE_CARDS.map((c, i) => (
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
              <Image src={c.img!} alt={c.alt ?? ""} fill sizes="45vw" className="object-cover" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
