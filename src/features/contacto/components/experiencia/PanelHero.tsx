import { TITULO } from "./data";
import { TITULO_TIPO } from "./estilos";

/**
 * 0 · HERO — "Hablemos." gigante y EDITORIAL: izquierda y a ancho total, en
 * el lenguaje del hero de Qué es ED. Nada más: sin eyebrow, sin bajada, sin
 * botón, sin hint de scroll y sin piezas flotando alrededor. Solo la palabra
 * — no hay nada que decidir todavía. Las letras las anima la intro.
 */
export function PanelHero({ activo }: { activo: boolean }) {
  return (
    <div
      data-panel="hero"
      aria-hidden={!activo}
      inert={!activo}
      className="absolute inset-x-5 top-0 bottom-0 md:inset-x-10"
    >
      <div className="flex h-full flex-col justify-center">
        <h1
          className={`${TITULO_TIPO.familia} ${TITULO_TIPO.peso}`}
          style={{ fontSize: "clamp(3.4rem, 1rem + 10vw, 9rem)", lineHeight: 0.95 }}
        >
          <span className="sr-only">{TITULO}</span>
          <span data-hero-titulo aria-hidden="true" className="inline-block whitespace-nowrap">
            {TITULO.split("").map((c, i) => (
              <span key={i} data-hero-char className="inline-block opacity-0 will-change-transform">
                {c}
              </span>
            ))}
          </span>
        </h1>
      </div>
    </div>
  );
}
