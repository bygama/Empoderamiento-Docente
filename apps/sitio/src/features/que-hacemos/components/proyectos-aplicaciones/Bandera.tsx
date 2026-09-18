import { useId } from "react";
import type { PaisKey } from "@/features/que-hacemos/proyectos";
import { PAISES } from "@/features/que-hacemos/proyectos";

/**
 * Banderas propias, flat y ondeadas, en un cuadro de 40 x 34 recortado
 * por una onda: las cuatro con la misma forma, para que un juego de dos o
 * tres se lea como un solo objeto. Dibujadas acá y no bajadas de un banco
 * de íconos: sin atribución que arrastrar y con un solo estilo. Los
 * colores son los de cada bandera —como los logos de los aliados, no son
 * tokens del sistema— y los emblemas van reducidos a su gesto: el sol, la
 * estrella, el globo, el águila con su serpiente y su laurel.
 */
// La onda de arriba, bajada `y`; y la misma onda de vuelta como borde de
// abajo. Toda franja horizontal es una BANDA entre dos ondas paralelas
// (Gastón, 2026-09-10: que el celeste siga el trazo de afuera, paralelo
// todo el tiempo, como en una bandera que flamea de verdad).
const ondaArriba = (y: number) =>
  `M 1 ${5 + y} C 8 ${1 + y} 14 ${1 + y} 20 ${4 + y} C 26 ${7 + y} 32 ${7 + y} 39 ${3 + y}`;
const ondaAbajo = (y: number) =>
  `L 39 ${3 + y} C 32 ${7 + y} 26 ${7 + y} 20 ${4 + y} C 14 ${1 + y} 8 ${1 + y} 1 ${5 + y} Z`;
const banda = (desde: number, hasta: number) => `${ondaArriba(desde)} ${ondaAbajo(hasta)}`;
// El paño entero: 26 de alto entre las dos ondas (más alto que ancho de
// proporción real, para que el sol y la estrella respiren en su franja).
const ALTO = 26;
const ONDA = banda(0, ALTO);

const DIBUJOS: Record<PaisKey, React.ReactNode> = {
  ar: (
    <>
      <rect width="40" height="34" fill="#75AADB" />
      <path d={banda(ALTO / 3, (ALTO * 2) / 3)} fill="#FFFFFF" />
      <circle cx="20" cy="17" r="2.5" fill="#F4B63F" />
    </>
  ),
  mx: (
    <>
      <rect width="40" height="34" fill="#FFFFFF" />
      <rect width="13.4" height="34" fill="#006847" />
      <rect x="26.6" width="13.4" height="34" fill="#CE1126" />
      {/* El escudo, en gesto: el águila parda de perfil con el ala alzada,
          la serpiente y el pico, y el laurel como media luna verde. Cuadro
          local de 10 x 10 centrado en el paño. */}
      <g transform="translate(15 12.2)">
        <path d="M 1.4 6.4 A 3.7 3.7 0 0 0 8.6 6.4" fill="none" stroke="#006847" strokeWidth="0.9" strokeLinecap="round" />
        {/* Ala alzada, con las plumas en punta. */}
        <path d="M 5.4 3.8 C 6 2.4 7.5 1.5 8.9 1.7 C 8.3 2.1 8.1 2.5 8.4 2.9 C 7.8 3 7.5 3.4 7.8 3.8 C 7.1 3.9 6.5 4.4 6.2 5 Z" fill="#8C5A2B" />
        {/* Cuerpo en gota, cola corta a la derecha. */}
        <path d="M 4.6 3.4 C 6.2 3 7.6 4 7.4 5.4 C 7.3 6.2 6.8 6.7 6.2 6.9 L 8.3 7.3 C 7.4 7.4 6.4 7.3 5.4 7 C 4.2 6.9 3.4 5.9 3.6 4.8 C 3.7 4.1 4.1 3.6 4.6 3.4 Z" fill="#8C5A2B" />
        {/* Cabeza chica, pico en gancho. */}
        <circle cx="4.1" cy="3" r="0.85" fill="#8C5A2B" />
        <path d="M 3.4 2.7 C 2.8 2.6 2.5 2.9 2.6 3.4 L 3.4 3.3 Z" fill="#F4B63F" />
        <path d="M 4.8 6.9 L 5.6 6.9 L 5.5 7.7 L 5 7.7 Z" fill="#F4B63F" />
        {/* La serpiente cuelga del pico. */}
        <path d="M 3 3.4 C 2.3 3.8 3.1 4.3 2.5 4.9 C 2 5.4 2.8 5.8 2.4 6.3" fill="none" stroke="#006847" strokeWidth="0.55" strokeLinecap="round" />
      </g>
    </>
  ),
  br: (
    <>
      <rect width="40" height="34" fill="#009B3A" />
      <path d="M 20 5.5 L 35.5 17 L 20 28.5 L 4.5 17 Z" fill="#FEDF00" />
      <circle cx="20" cy="17" r="5.4" fill="#002776" />
      <path d="M 15 15.5 C 18.4 14.4 21.8 14.8 25 16.9" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
    </>
  ),
  cl: (
    <>
      <rect width="40" height="34" fill="#D52B1E" />
      <path d={banda(0, ALTO / 2)} fill="#FFFFFF" />
      {/* El cantón azul: la mitad de arriba, recortada a la izquierda. */}
      <path d={banda(0, ALTO / 2)} fill="#0039A6" clipPath="inset(0 66.5% 0 0)" />
      <path
        d="M 6.7 3.6 L 7.6 6.2 L 10.3 6.2 L 8.1 7.8 L 8.9 10.4 L 6.7 8.8 L 4.5 10.4 L 5.3 7.8 L 3.1 6.2 L 5.8 6.2 Z"
        fill="#FFFFFF"
        transform="translate(0.4 2.7)"
      />
    </>
  ),
};

export function Bandera({ pais, className }: { pais: PaisKey; className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 40 34"
      role="img"
      aria-label={`Bandera de ${PAISES[pais]}`}
      className={className}
    >
      <defs>
        <clipPath id={id}>
          <path d={ONDA} />
        </clipPath>
      </defs>
      {/* Borde blanco por detrás: separa la bandera de la de al lado cuando
          van solapadas. */}
      <path d={ONDA} fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
      <g clipPath={`url(#${id})`}>{DIBUJOS[pais]}</g>
      <path d={ONDA} fill="none" stroke="rgb(31 45 77 / 0.14)" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Una o varias banderas, apenas encimadas, como un juego. */
export function Banderas({ paises }: { paises: readonly PaisKey[] }) {
  return (
    <span className="flex items-center">
      {paises.map((pais, i) => (
        <Bandera
          key={pais}
          pais={pais}
          className={"h-9 w-auto shrink-0" + (i > 0 ? " -ml-1" : "")}
        />
      ))}
    </span>
  );
}
