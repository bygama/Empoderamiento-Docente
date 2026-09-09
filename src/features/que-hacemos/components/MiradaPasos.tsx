import Image from "next/image";
import { ALIADOS } from "@/config/aliados";
import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/areas";

/**
 * Cómo trabajamos, en los seis verbos que ED usa para contarse («La mirada
 * ED»: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar).
 *
 * Va justo después del faro (Gastón, 2026-09-09), cuyo final es el velo
 * blanco del deslumbre: por eso la sección es blanca y las tarjetas grises,
 * al revés que antes. Con fondo gris había un corte seco en la junta.
 *
 * DISPOSICIÓN: el titular queda pegado a la izquierda mientras las seis
 * tarjetas SE APILAN a la derecha —cada una se frena y la siguiente se le
 * monta encima dejando asomar su canto— y abajo, cruzando las dos columnas,
 * la banda de aliados.
 *
 * El apilado es CSS puro: cada tarjeta es `sticky` con un `top` un escalón
 * más abajo que la anterior. No hay GSAP ni ScrollTrigger, y por lo tanto
 * tampoco timeline que limpiar ni `prefers-reduced-motion` que atender: nada
 * se anima, solo se frena. Lo resuelve el compositor del navegador.
 *
 * El escalón va en `style` y no en una clase porque depende del índice, y
 * Tailwind no genera clases con valores calculados en runtime.
 *
 * Solo desde `lg`: en celular las tarjetas van una abajo de la otra. Apilar
 * seis piezas en una pantalla angosta deja al pulgar peleando contra el
 * sticky para salir de la sección.
 */

/** Dónde se frena cada tarjeta: 7rem libra el navbar, 1rem por escalón. */
const alturaDeFreno = (i: number) => `calc(7rem + ${i} * 1rem)`;

export function MiradaPasos() {
  return (
    <section
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Columna izquierda: se queda quieta mientras el mazo se arma. */}
          <header className="max-w-[46ch] lg:sticky lg:top-32 lg:self-start">
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

          {/* Columna derecha: el mazo. El borde y la sombra no son decorado:
              sin ellos, dos tarjetas grises superpuestas se leen como una
              sola mancha y el canto de la de abajo desaparece. */}
          <ol className="mt-12 space-y-5 lg:mt-0 lg:space-y-6">
            {MIRADA.map((p, i) => (
              <li
                key={p.verbo}
                className="border-azul-principal/8 bg-gris-fondo rounded-[1.25rem] border p-6 shadow-[0_-8px_24px_-16px_rgb(31_45_77/0.35)] md:p-7 lg:sticky"
                style={{ top: alturaDeFreno(i) }}
              >
                <p className="text-gris-texto font-mono text-[0.75rem] tracking-[0.18em]">
                  0{i + 1}
                </p>
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

        {/* Al pie, cruzando las dos columnas. Los logos son los autorizados de
            config/aliados (AGENTS §5.4): los mismos que ya publican el pie y
            la home, con el mismo filtro que los pinta de blanco sobre navy. */}
        <div className="bg-azul-principal mt-16 rounded-[1.75rem] px-6 py-10 md:mt-20 md:px-12">
          <p className="text-azul-claro/80 text-center font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
            Nos acompañan
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
            {ALIADOS.map((a) => (
              <li key={a.src} className="flex h-12 items-center">
                {/* El alto lo manda la clase y el ancho va `auto`: las medidas
                    del archivo (config/aliados) solo reservan la proporción. */}
                <Image
                  src={a.src}
                  alt={a.alt}
                  width={a.w}
                  height={a.h}
                  unoptimized={"vectorial" in a}
                  draggable={false}
                  className={`${a.alto.home} w-auto opacity-75 [filter:brightness(0)_invert(1)]`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
