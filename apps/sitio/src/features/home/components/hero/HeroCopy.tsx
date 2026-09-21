import { Fragment } from "react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { Hero } from "@/features/home/contenido/hero";

type Props = { contenido: Pick<Hero, "titulo" | "bajada" | "botonPrincipal" | "botonSecundario"> };

/**
 * Contenido CENTRADO en el primer viewport (se va con el scroll): halo de
 * legibilidad, titular palabra por palabra, descripción y acciones. Todo
 * entra por data-attributes desde la coreografía del hero. El texto llega por
 * props: es lo que se edita desde el admin.
 */
export function HeroCopy({ contenido }: Props) {
  // Cada palabra es un <span data-hero-word> para animarla; la última lleva
  // el acento verde (data-hero-accent): es la que remata la frase. Se parte
  // por cualquier espacio: dos seguidos no dejan un span vacío.
  const palabras = contenido.titulo.split(/\s+/);
  return (
    <div
      data-hero-copy-scroll
      className="absolute inset-x-0 top-0 z-20 flex h-screen flex-col items-center justify-center px-5 text-center md:px-10"
    >
      {/* Halo blanco suave detrás del texto central (solo desktop ≥ lg). En
          desktop angosto el scatter se acerca al copy; este velo difumina SOLO
          las fotos que quedan detrás de las palabras (las de los costados se
          ven igual) y deja el texto flotando limpio sin reubicar las cards.
          Vive dentro del copy → se desvanece con el scroll junto al texto. En
          mobile el scatter va en bandas que no tocan el centro → no se monta. */}
      <span
        data-hero-halo
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden h-[clamp(26rem,80vh,36rem)] w-[clamp(30rem,62vw,52rem)] -translate-x-1/2 -translate-y-[45%] lg:block"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.9) 46%, rgba(255,255,255,0) 78%)",
        }}
      />
      <div data-hero-copy className="mx-auto max-w-2xl translate-y-[5vh]">
        <h1
          data-hero-headline
          className="font-display font-bold text-balance tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.85rem, 1rem + 2.4vw, 2.7rem)", lineHeight: 1.12 }}
        >
          {palabras.map((palabra, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              {i === palabras.length - 1 ? (
                <span data-hero-word data-hero-accent className="text-verde-concepto inline-block">
                  {palabra}
                </span>
              ) : (
                <span data-hero-word className="inline-block">
                  {palabra}
                </span>
              )}
            </Fragment>
          ))}
        </h1>

        <p
          data-hero-desc
          className="text-gris-texto mx-auto mt-6 max-w-[40rem] text-balance font-sans text-[1.02rem] leading-relaxed md:text-[1.12rem]"
        >
          {contenido.bajada}
        </p>

        <div
          data-hero-actions
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {/* La acción principal al final del recorrido del ojo, y del lado
              en que el navbar tiene Contacto (Gastón, 2026-09-11). */}
          <ButtonSecondary href={contenido.botonSecundario.ruta}>{contenido.botonSecundario.texto}</ButtonSecondary>
          <ButtonPrimary href={contenido.botonPrincipal.ruta}>{contenido.botonPrincipal.texto}</ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
