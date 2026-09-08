import type { Perspectiva } from "./constelacion-mirada";

type Props = {
  p: Perspectiva;
  i: number;
  live: boolean;
};

/**
 * Fichas conceptuales de un principio: se apilan bajo el nodo activo y
 * entran de a una con el scroll (la posición la fija `prepararEstados`). Sin
 * semántica interactiva. Fondo sólido: si una línea del mapa cruza por
 * detrás, la ficha la tapa limpia (con /90 se transparentaba).
 */
export function FichasPerspectiva({ p, i, live }: Props) {
  return (
    <ul
      data-fichas={i}
      className={
        "m-0 flex list-none flex-wrap items-center justify-center gap-3 px-6 pb-10 motion-reduce:mx-auto motion-reduce:max-w-xl" +
        (live ? "" : " mx-auto max-w-xl")
      }
    >
      {p.fichas.map((f, k) => (
        <li
          key={f}
          data-ficha
          className="border-azul-principal/12 rounded-xl border bg-white px-5 py-3 font-sans text-[0.95rem] font-medium shadow-[0_10px_30px_-18px_rgb(31_45_77/0.35)]"
          style={{
            color: "#1f2d4d",
            borderLeft: `3px solid ${p.accent}`,
            transitionDelay: `${k * 40}ms`,
          }}
        >
          {f}
        </li>
      ))}
    </ul>
  );
}
