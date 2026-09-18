import { PROYECTOS_INTRO } from "@/features/que-hacemos/proyectos";
import { TituloPractica } from "./TituloPractica";

/**
 * El título de la sección EN GRANDE durante el solo de la víbora, en el
 * lugar exacto donde después cae la primera ficha (misma columna que la
 * pila): la víbora lo trae al cruzar, se queda todo el solo para que se
 * lea, y al final se disuelve mientras el encabezado chico aparece arriba
 * a la izquierda y la ficha 01 ocupa su sitio. Gastón (2026-09-09): que
 * no se pierda el foco de qué estamos mostrando. Es un duplicado visual
 * (aria-hidden): el h2 real vive en el encabezado.
 */
export function TituloGrande() {
  return (
    <div
      data-titulo-grande
      aria-hidden="true"
      className="text-azul-principal absolute top-1/2 right-5 w-[clamp(380px,34vw,40rem)] -translate-y-1/2 md:right-10"
      style={{ opacity: 0 }}
    >
      <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
        {PROYECTOS_INTRO.volanta}
      </p>
      <p
        className="font-display mt-5 font-extrabold tracking-[-0.03em] text-balance"
        style={{
          fontSize: "clamp(2.6rem, 1.2rem + 3.2vw, 4.4rem)",
          lineHeight: 1,
        }}
      >
        <TituloPractica />
      </p>
    </div>
  );
}
