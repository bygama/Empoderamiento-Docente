import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/areas";

/**
 * Cómo trabajamos, en los seis verbos que ED usa para contarse («La mirada
 * ED»: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar).
 * Tira estática de seis tarjetas: se lee entera de un vistazo. La versión
 * animada del método (cuatro pasos, scroll-story) sigue viviendo en el
 * Inicio; acá el camino horizontal que había duplicaba eso y se sacó.
 *
 * Va justo después del faro (Gastón, 2026-09-09), cuyo final es el velo
 * blanco del deslumbre: por eso la sección es blanca y las tarjetas grises,
 * al revés que antes. Con fondo gris había un corte seco en la junta.
 */
export function MiradaPasos() {
  return (
    <section
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <header className="max-w-[62ch]">
          <h2
            className="font-display text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem]"
            style={{ lineHeight: 1.1 }}
          >
            {MIRADA_INTRO.titulo}
          </h2>
          <p className="text-gris-texto mt-5 font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
            {MIRADA_INTRO.texto}
          </p>
        </header>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {MIRADA.map((p, i) => (
            <li
              key={p.verbo}
              className="bg-gris-fondo rounded-[1.25rem] p-6 md:p-7"
            >
              <p className="text-gris-texto font-mono text-[0.75rem] tracking-[0.18em]">0{i + 1}</p>
              <h3 className="font-display mt-2 text-[1.45rem] font-bold tracking-[-0.01em]">
                {p.verbo}
              </h3>
              <p className="text-verde-concepto-texto font-display mt-2 text-[1rem] font-semibold">
                {p.idea}
              </p>
              <p className="text-azul-principal/80 mt-3 font-sans text-[0.95rem] leading-relaxed">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
