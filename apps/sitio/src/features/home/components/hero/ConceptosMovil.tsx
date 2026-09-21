import Image from "next/image";
import type { Hero } from "@/features/home/contenido/hero";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { CONCEPTOS_MOVIL } from "./geometria-hero";

/**
 * Tramo de conceptos del hero en celular y tablet (< lg): las fotos con cartel
 * que en escritorio rodean al título acá se cuentan de a una, en zigzag, a
 * medida que se baja. Cada foto trae su cartel completo (título y bajada), que
 * entra cuando la foto aparece en pantalla (`hero/conceptos-movil.ts`). Cada
 * foto arranca un poco antes de que termine la anterior: el cartel de una
 * queda montado sobre la esquina de la que sigue, como en el campo de escritorio.
 *
 * A diferencia del campo de escritorio, no es decorativo: es una lista real,
 * con sus `alt`, porque acá los conceptos se leen como contenido.
 */
export function ConceptosMovil({ tarjetas }: { tarjetas: Hero["tarjetas"] }) {
  // Solo las que tienen cartel: sin texto, una foto sola no cuenta un concepto.
  const conceptos = CONCEPTOS_MOVIL.flatMap((g) => {
    const t = tarjetas[g.tarjeta];
    return t?.cartel ? [{ ...g, foto: t.foto, cartel: t.cartel }] : [];
  });
  return (
    <ul className="relative z-10 mx-auto flex w-full max-w-[36rem] flex-col px-5 pt-6 pb-14 lg:hidden">
      {conceptos.map((c, i) => {
        const derecha = i % 2 === 1;
        return (
          <li
            key={`${c.tarjeta}-${c.foto.src}`}
            data-concepto
            className={`flex flex-col ${i ? "-mt-10" : ""} ${derecha ? "items-end self-end" : "items-start self-start"}`}
            // El tope en rem es para tablet: sin él las fotos crecen con la pantalla
            // y el tramo se hace eterno.
            style={{ width: `clamp(9rem, ${c.w}vw, ${(c.w * 0.36).toFixed(1)}rem)` }}
          >
            <div
              data-concepto-foto
              className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
              style={{ aspectRatio: c.ar }}
            >
              <Image src={c.foto.src} alt={c.foto.alt} fill sizes="(min-width: 48rem) 24rem, 64vw" className="object-cover" style={estiloDeFoco(c.foto.foco)} />
            </div>
            {/* Cuelga del borde inferior, del lado de afuera, como en
                escritorio; en el flujo, para que la foto siguiente no lo pise. */}
            <div
              data-concepto-cartel
              className={`ring-azul-principal/10 relative z-10 -mt-4 w-max max-w-[78vw] rounded-xl bg-white/90 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 ${derecha ? "mr-3" : "ml-3"}`}
            >
              <p className="font-display text-verde-concepto text-[0.9rem] leading-tight font-semibold tracking-[-0.01em]">
                {c.cartel.titulo}
              </p>
              <p className="text-gris-texto mt-0.5 font-sans text-[0.8rem] leading-snug">
                {c.cartel.descripcion}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
