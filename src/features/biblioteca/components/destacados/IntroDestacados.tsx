import Image from "next/image";
import type { RefObject } from "react";
import type { ItemDestacado } from "../../data/materiales";

/**
 * Fase 1: intro con pantalla propia — eyebrow, titular a dos azules, párrafo
 * del equipo y la fila de las 4 portadas viajeras (que en desktop la
 * coreografía pinea, converge y barre).
 */
export function IntroDestacados({
  items,
  refRow,
}: {
  items: ReadonlyArray<ItemDestacado>;
  refRow: RefObject<HTMLDivElement | null>;
}) {
  return (
    /* Alto por contenido (sin min-h de pantalla): así la banda azul viene
       enseguida después de las portadas. Los espacios son todos fijos:
       pt corto (cerca del hero), gap generoso titular→portadas y un pb
       moderado antes de la banda. */
    <div className="mx-auto w-full max-w-screen-xl px-5 pt-14 pb-16 md:px-10 md:pt-20 md:pb-20">
      <div className="md:grid md:grid-cols-12 md:gap-x-8">
        <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase md:col-span-3">
          Material destacado
        </p>
        <h2
          className="font-display mt-6 font-extrabold tracking-[-0.02em] md:col-span-9 md:mt-0"
          style={{ fontSize: "clamp(2.2rem, 1rem + 4.5vw, 4.25rem)", lineHeight: 1.05 }}
        >
          <span className="text-verde-concepto">Cuatro materiales</span>{" "}
          <span className="text-azul-principal">para entrar a la biblioteca</span>
        </h2>
      </div>

      <div className="mt-20 md:mt-36 md:grid md:grid-cols-12 md:items-end md:gap-x-8">
        <p className="text-gris-texto max-w-[38ch] font-sans text-[0.97rem] leading-relaxed md:col-span-3">
          Una selección corta del equipo: la investigación que da origen a
          ED y tres materiales listos para el aula. Si llegás por primera
          vez, empezá por acá.
        </p>
        {/* Las 4 portadas "viajeras": acá son la fila de la intro; en
            desktop se pinean, convergen sobre el slot y las barre cada
            divisoria. */}
        <div
          ref={refRow}
          className="z-30 mt-10 grid grid-cols-2 gap-3 md:col-span-9 md:mt-0 md:grid-cols-4 md:gap-4"
        >
          {items.map(({ titulo, material }) => (
            <div
              key={titulo}
              data-viajera
              className="bg-azul-claro/30 relative aspect-[3/4] overflow-hidden rounded-xl will-change-transform"
            >
              <Image
                src={material.portada}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
