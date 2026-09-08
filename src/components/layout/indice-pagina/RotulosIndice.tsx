import type { PointerEvent } from "react";
import type { ItemIndice } from "@/lib/hooks/useImanIndice";

type Props = {
  items: ItemIndice[];
  visible: boolean;
  interactivo: boolean;
  /** Índice de la fila más cercana al puntero (la que se ilumina). */
  cerca: number | null;
  esActiva: (id: string | null) => boolean;
  refPildora: (i: number) => (el: HTMLButtonElement | null) => void;
  onEntrar: (clientY: number) => void;
  onSalir: () => void;
  onIr: (i: number, it: ItemIndice) => void;
};

/**
 * Rótulos del índice: misma grilla de filas que las marcas, corrida el ancho
 * de la marca estirada más el aire. Se mueven con GSAP (ver `aplicar` en
 * useImanIndice).
 *
 * Cada rótulo es un BOTÓN, no un `<span>` con onClick: lo que se toca para
 * navegar tiene que ser un control de verdad. Va con `tabIndex={-1}` porque
 * el índice entero es decorativo (`aria-hidden` en el contenedor) y duplica
 * el nav del header: se opera con el mouse, y quien va por teclado usa ese
 * nav. Las tres primeras clases resetean lo que el agente le pone a un botón
 * (borde, fondo y alineación) para que se vea igual que el span de antes.
 *
 * El `onMouseDown` que cancela el default NO es decoración: `tabIndex={-1}`
 * saca al botón del tabulador pero NO del foco por clic, y un descendiente
 * enfocado hace que Chrome IGNORE el `aria-hidden` del contenedor y exponga
 * todo el índice —justo lo que este bloque evita— además de dejar el foco en
 * un control sin contexto. Cancelando el mousedown el clic sigue disparando y
 * el foco no se mueve.
 */
export function RotulosIndice({
  items,
  visible,
  interactivo,
  cerca,
  esActiva,
  refPildora,
  onEntrar,
  onSalir,
  onIr,
}: Props) {
  const entrar = (e: PointerEvent<HTMLDivElement>) => onEntrar(e.clientY);
  return (
    <div
      aria-hidden="true"
      onPointerEnter={entrar}
      onPointerMove={entrar}
      onPointerLeave={onSalir}
      className={`fixed top-1/2 right-[4.25rem] z-40 hidden -translate-y-1/2 transition-opacity duration-300 lg:block ${
        visible ? "opacity-100" : "opacity-0"
      } ${interactivo ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <ol className="flex flex-col items-end">
        {items.map((it, i) => (
          <li key={it.id ?? "arriba"} className="flex h-7 items-center justify-end">
            <button
              type="button"
              tabIndex={-1}
              ref={refPildora(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onIr(i, it)}
              className={`cursor-pointer appearance-none rounded-full border-0 bg-transparent px-2.5 py-1 text-left font-mono text-[0.62rem] tracking-[0.2em] whitespace-nowrap uppercase shadow-[0_6px_18px_-10px_rgb(31_45_77/0.45)] ring-1 backdrop-blur transition-colors duration-200 ${
                interactivo && cerca === i
                  ? "bg-azul-principal ring-azul-principal text-white"
                  : "text-azul-principal ring-azul-principal/10 bg-white/92"
              } ${esActiva(it.id) ? "font-semibold" : ""}`}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
