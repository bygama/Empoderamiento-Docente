import type { PictoKey } from "@/features/que-hacemos/proyectos";

/**
 * Pictogramas de las fichas: dibujos de línea, trazo único en el azul del
 * texto y UN acento verde por dibujo, el mismo lenguaje del faro y del
 * logo (nada de emojis). Cuadro de 48 x 48. El color lo pone el contexto
 * (`currentColor`); el verde es el token de concepto.
 */
const VERDE = "var(--color-verde-concepto)";

const DIBUJOS: Record<PictoKey, React.ReactNode> = {
  // Tres cuadernillos en abanico, el de arriba con su lomo verde.
  cuadernillos: (
    <>
      <rect
        x="9"
        y="15"
        width="22"
        height="27"
        rx="2"
        transform="rotate(-10 20 28)"
      />
      <rect
        x="15"
        y="12"
        width="22"
        height="27"
        rx="2"
        transform="rotate(-2 26 25)"
      />
      <rect
        x="21"
        y="9"
        width="22"
        height="27"
        rx="2"
        transform="rotate(7 32 22)"
      />
      <path d="M25 11 l3 -0.4 v8" stroke={VERDE} strokeWidth="2.2" />
    </>
  ),
  // Una pantalla y, adentro, la curva de un aprendizaje que sube.
  cursos: (
    <>
      <rect x="6" y="9" width="36" height="24" rx="3" />
      <path d="M18 41 h12 M24 33 v8" />
      <path
        d="M12 27 C 16 27 18 17 22 19 S 28 27 32 22 S 36 15 37 14"
        stroke={VERDE}
        strokeWidth="2.2"
      />
    </>
  ),
  // Tres nodos unidos, y el del medio es verde.
  comunidad: (
    <>
      <circle cx="12" cy="34" r="5" />
      <circle cx="36" cy="34" r="5" />
      <circle cx="24" cy="12" r="5" />
      <path d="M16 31 l5 -14 M32 31 l-5 -14 M17 34 h14" />
      <circle cx="24" cy="30" r="3" fill={VERDE} stroke="none" />
    </>
  ),
  // Una persona que irradia: la cabeza y, alrededor, rayos verdes.
  lideres: (
    <>
      <circle cx="24" cy="17" r="6" />
      <path d="M10 42 c0 -10 28 -10 28 0" />
      <path
        d="M24 4 v3 M12 9 l2 2 M36 9 l-2 2 M7 20 h3 M38 20 h3"
        stroke={VERDE}
        strokeWidth="2.2"
      />
    </>
  ),
  // Una hoja de examen con sus renglones y un tilde verde.
  examen: (
    <>
      <rect x="11" y="6" width="26" height="36" rx="2.5" />
      <path d="M17 16 h14 M17 22 h14 M17 28 h8" />
      <circle cx="31" cy="34" r="6" fill="white" />
      <path d="M28 34 l2.2 2.2 l4 -4.5" stroke={VERDE} strokeWidth="2.2" />
    </>
  ),
  // Un libro abierto con su señalador verde.
  materiales: (
    <>
      <path d="M24 12 C 20 9 13 8 7 9 v27 c6 -1 13 0 17 3 z" />
      <path d="M24 12 C 28 9 35 8 41 9 v27 c-6 -1 -13 0 -17 3 z" />
      <path
        d="M32 9 v11 l3 -2.5 l3 2.5 v-11"
        stroke={VERDE}
        strokeWidth="2.2"
      />
    </>
  ),
  // Una progresión en escalones, y el último escalón lleva un punto verde.
  curricula: (
    <>
      <path d="M6 40 h9 v-9 h9 v-9 h9 v-9 h9" />
      <path d="M6 40 h36" />
      <circle cx="39" cy="10" r="3.5" fill={VERDE} stroke="none" />
    </>
  ),
  // Tres marcas de mapa unidas; la del medio es la verde.
  paises: (
    <>
      <path d="M10 22 a5 5 0 1 1 10 0 c0 4 -5 9 -5 9 s-5 -5 -5 -9 z" />
      <path d="M28 14 a5 5 0 1 1 10 0 c0 4 -5 9 -5 9 s-5 -5 -5 -9 z" />
      <path
        d="M20 36 a4 4 0 1 1 8 0 c0 3 -4 7 -4 7 s-4 -4 -4 -7 z"
        fill={VERDE}
        stroke={VERDE}
      />
      <path d="M18 27 l6 8 M31 21 l-6 14" />
    </>
  ),
};

export function Pictograma({
  tipo,
  className,
}: {
  tipo: PictoKey;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {DIBUJOS[tipo]}
    </svg>
  );
}
