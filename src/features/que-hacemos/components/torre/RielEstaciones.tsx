import type { Ref } from "react";
import { TAMBORES } from "../../data";

type Props = {
  refNav: Ref<HTMLElement>;
  refBoton: (i: number) => (el: HTMLButtonElement | null) => void;
  onSaltar: (i: number) => void;
};

/**
 * Riel izquierdo: las estaciones, clickeables. `data-active` lo escribe
 * `pintar` cuando cambia la estación (sin re-render de React).
 */
export function RielEstaciones({ refNav, refBoton, onSaltar }: Props) {
  return (
    <nav
      ref={refNav}
      aria-hidden="true"
      className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col gap-1 lg:flex xl:left-8"
    >
      {/* Encabezado del riel: el riel es la tabla de contenidos de
          la sección; esto es el nombre de la tabla. Permanente. */}
      <p className="text-azul-principal/80 mb-2 font-mono text-[0.62rem] font-semibold tracking-[0.16em] uppercase">
        Líneas de acción
      </p>
      {TAMBORES.map((t, i) => (
        <button
          key={t.id}
          ref={refBoton(i)}
          type="button"
          tabIndex={-1}
          data-active={i === 0}
          onClick={() => onSaltar(i)}
          // La activa se nota por tres restas y sumas chicas: sube un
          // escalón de tamaño, se corre 4px a la derecha (rompe la
          // columna) y las demás retroceden al 40%. Sin bold ni
          // fondo: en mono chica el bold se empasta y el fondo
          // vuelve botonera al riel.
          className="group text-gris-texto/40 hover:text-azul-principal data-[active=true]:text-azul-principal flex cursor-pointer items-center gap-2 py-0.5 text-left font-mono text-[0.62rem] tracking-[0.12em] uppercase transition-[color,font-size,transform] duration-300 ease-out data-[active=true]:translate-x-1 data-[active=true]:text-[0.72rem]"
        >
          {/* El punto se estira a un guion verde en la activa: el
              gesto de "estás acá" lee mejor que un punto más grande. */}
          <span className="group-data-[active=true]:bg-verde-concepto inline-block h-1 w-1 rounded-full bg-current opacity-40 transition-[width,opacity,background-color] duration-300 ease-out group-data-[active=true]:w-3 group-data-[active=true]:opacity-100" />
          {String(i + 1).padStart(2, "0")} {t.tambor}
        </button>
      ))}
    </nav>
  );
}
