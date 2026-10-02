import { TITULO_TIPO } from "./estilos";
import { panelClases } from "./movil";

/**
 * 0 · HERO — "Hablemos." gigante y EDITORIAL: izquierda y a ancho total, en
 * el lenguaje del hero de Qué es ED. Nada más: sin eyebrow, sin bajada, sin
 * botón, sin hint de scroll y sin piezas flotando alrededor. Solo la palabra
 * — no hay nada que decidir todavía. Las letras las anima la intro. El
 * titular llega por props (de `features/contacto/contenido/titular.ts` o de
 * la base).
 */
export function PanelHero({ activo, titulo }: { activo: boolean; titulo: string }) {
  return (
    <div
      data-panel="hero"
      aria-hidden={!activo}
      inert={!activo}
      className={`flex flex-col justify-center ${panelClases(activo)}`}
    >
      <h1
        className={`${TITULO_TIPO.familia} ${TITULO_TIPO.peso}`}
        style={{ fontSize: "clamp(3.4rem, 1rem + 10vw, 9rem)", lineHeight: 0.95 }}
      >
        <span className="sr-only">{titulo}</span>
        <span data-hero-titulo aria-hidden="true" className="inline-block whitespace-nowrap">
          {titulo.split("").map((c, i) => (
            <span key={i} data-hero-char className="inline-block opacity-0">
              {c}
            </span>
          ))}
        </span>
      </h1>
    </div>
  );
}
