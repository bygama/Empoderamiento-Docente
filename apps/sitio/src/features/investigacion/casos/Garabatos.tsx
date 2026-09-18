/**
 * Marcas "a mano" y siluetas del expediente: pestaña troquelada orgánica,
 * clip metálico, flecha manuscrita y subrayado de marcador. SVG inline con
 * currentColor para que cada caso las tiña desde el design system.
 */

type SvgProps = {
  className?: string;
};

/**
 * Pestaña de carpeta con silueta orgánica: pies acampanados con curva
 * cóncava y hombros redondeados (la forma de una pestaña troquelada real,
 * no un trapezoide duro). El fill toma el color de texto del wrapper
 * (tinta del caso); el contenido va encima en blanco.
 */
export function Pestana({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={`relative flex items-center justify-center ${className ?? ""}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 224 44"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0 44 C16 44 22.5 36.5 28 21.5 C33.5 7.5 42 0 58 0 L166 0 C182 0 190.5 7.5 196 21.5 C201.5 36.5 208 44 224 44 Z"
          fill="currentColor"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/** Clip metálico que sujeta una lámina al expediente. */
export function ClipPapel({ className }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 26 48"
      fill="none"
      className={className}
    >
      <path
        d="M8 13v22a5 5 0 0 0 10 0V9.5a3.5 3.5 0 0 0-7 0V33a1.6 1.6 0 0 0 3.2 0V13.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Flecha curva dibujada a mano (anotación editorial). */
export function FlechaManuscrita({ className }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 56"
      fill="none"
      className={className}
    >
      <path
        d="M5 10c26-7 62-3 88 20 2 1.8 4.4 4 6.5 6.4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M89 32.5 100.5 37l-3-12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Subrayado tipo marcador (doble pasada, con temblor humano). */
export function SubrayadoMarcador({ className }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 18"
      fill="none"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M5 10c52-4.5 148-6 291-3"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M14 13.5c78-3 168-4 276-2.5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
