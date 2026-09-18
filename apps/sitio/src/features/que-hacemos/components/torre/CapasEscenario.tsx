import type { Ref } from "react";

type Props = {
  refSuperficie: Ref<HTMLSpanElement>;
  refVelo: Ref<HTMLSpanElement>;
  refNiebla: (i: number) => (el: HTMLSpanElement | null) => void;
};

/**
 * Las capas del escenario: la superficie gris con su trama, el velo blanco
 * del relevo con el faro y las nieblas de arriba y abajo. Todas decorativas
 * y todas las escribe `pintar` por opacidad.
 */
export function CapasEscenario({ refSuperficie, refVelo, refNiebla }: Props) {
  return (
    <>
      {/* Superficie del escenario: el gris de la página con su trama de
          puntos. Vive DENTRO del escenario para que entre junto con los
          tambores — el conjunto se funde ENCIMA de la luz del faro en vez
          de que la luz se corra. */}
      <span
        ref={refSuperficie}
        aria-hidden="true"
        className="bg-gris-fondo pointer-events-none absolute inset-0"
      >
        <span className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
      </span>
      {/* Velo blanco del relevo: el mismo blanco en que termina el faro,
          por encima de TODO el escenario (z-30, sobre header, rieles y
          apoyos). El armado lo disuelve por tiempo (build.velo); de ahí
          emergen la superficie, la trama y el tambor. */}
      <span
        ref={refVelo}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-white"
      />
      {/* Niebla arriba y abajo del escenario: los tambores que entran o
          salen se desvanecen antes de pisar el encabezado o los apoyos.
          (z-10: sobre la escena, debajo de header/rieles/apoyos en z-20.) */}
      <span
        ref={refNiebla(0)}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-gris-fondo) 20%, color-mix(in srgb, var(--color-gris-fondo) 65%, transparent), transparent)",
        }}
      />
      <span
        ref={refNiebla(1)}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-60"
        style={{
          background:
            "linear-gradient(to top, var(--color-gris-fondo) 30%, color-mix(in srgb, var(--color-gris-fondo) 70%, transparent), transparent)",
        }}
      />
    </>
  );
}
