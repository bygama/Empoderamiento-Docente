import Image from "next/image";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import type { FotoMovil } from "./fotos-movil";

/**
 * Banda de dos fotos del primer pantallazo en celular y tablet (< lg). Va EN EL
 * FLUJO del copy, una arriba del texto y otra abajo, y se reparte con su gemela
 * el alto que el texto deja libre: por eso las fotos no pueden pisar los
 * botones, mida lo que mida la pantalla. El tamaño sale del ALTO —hasta el
 * ancho ideal de cada foto—, así en una pantalla baja se achican enteras en vez
 * de recortarse.
 *
 * `[data-mcard]` es la capa que anima la entrada (pila → su lugar): su
 * transform es 100 % de GSAP, el lugar se lo da el flex.
 */
export function BandaFotosMovil({
  fotos,
  cartelA,
  className = "",
}: {
  fotos: FotoMovil[];
  /** De qué lado cuelga el cartel: el de afuera, para no ir hacia el centro. */
  cartelA: "izquierda" | "derecha";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex min-h-0 w-full max-w-[44rem] flex-1 items-center justify-around gap-4 lg:hidden ${className}`}
    >
      {fotos.map((c, i) => (
        <div
          key={`${i}-${c.foto.src}`}
          data-mcard
          className="relative shrink-0"
          style={{
            // La segunda, un poco más baja: dos fotos iguales a la misma altura
            // se leen como una grilla, no como un campo.
            height: `min(${i ? 86 : 100}%, calc(clamp(6rem, ${c.w}vw, 16rem) / ${c.ar}))`,
            aspectRatio: c.ar,
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40">
            <Image src={c.foto.src} alt="" fill sizes="45vw" className="object-cover" style={estiloDeFoco(c.foto.foco)} />
          </div>
          {c.cartel && (
            <div
              data-card-label
              className={`ring-azul-principal/10 absolute -bottom-3 z-10 w-max max-w-[46vw] rounded-xl bg-white/90 px-3 py-1.5 text-left shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 md:-bottom-5 md:px-3.5 md:py-2.5 ${cartelA === "derecha" ? "right-2" : "left-2"}`}
            >
              <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                {c.cartel.titulo}
              </p>
              {/* La bajada, recién en tablet: en celular no entra sin tapar. */}
              <p className="text-gris-texto mt-0.5 hidden font-sans text-[0.72rem] leading-snug md:block">
                {c.cartel.descripcion}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
