import type { CSSProperties, ReactNode } from "react";
import { Highlight } from "@/components/ui/Highlight";
import { EspiralSvg } from "./EspiralSvg";
import { REMATE_TEXTO, VUELTA_1, VUELTA_2, type Estacion } from "./estaciones";
import { ANOTACIONES, INDICE_REMATE, posicionAnotacion, type Lado } from "./lamina-espiral";

const ESTACIONES_EN_ORDEN: ReadonlyArray<Estacion> = [...VUELTA_1, ...VUELTA_2];

/**
 * La caja de cada anotación se cuelga del ancla (donde termina la guía)
 * con left/right/top/bottom, nunca con `translate`: GSAP reescribe el
 * transform del bloque al animarlo y se lleva puesto cualquier translate
 * de CSS. Las laterales se centran en el ancla con una caja de alto cero.
 */
function cajaDeAncla(lado: Lado, { left, top }: { left: number; top: number }): CSSProperties {
  const l = `${left}%`;
  const t = `${top}%`;
  const centrada: CSSProperties = { height: 0, display: "flex", alignItems: "center" };
  switch (lado) {
    case "arriba":
    case "arriba-derecha":
      return { left: l, bottom: `${100 - top}%` };
    case "abajo":
      return { left: l, top: t };
    case "derecha":
      return { left: l, top: t, ...centrada };
    case "izquierda":
      return { right: `${100 - left}%`, top: t, ...centrada, justifyContent: "flex-end" };
  }
}

/** Respiro entre la guía y el texto, por lado. */
const CAJA: Record<Lado, string> = {
  arriba: "pb-3 -ml-3",
  abajo: "pt-3 -ml-3",
  derecha: "pl-3",
  izquierda: "pr-3",
  "arriba-derecha": "pb-2 pl-1",
};

/** Ancho de la caja de cada anotación, en ch DEL CUERPO DEL TEXTO (índice
 *  de ANOTACIONES; la última es el remate): la caja lleva la letra del
 *  texto y escala con ella, así los cortes de renglón no cambian con el
 *  alto de pantalla. Facundo (2026-09-14): el nombre en UN renglón y el
 *  texto en TRES, sin excepción. Cada ancho está afinado para eso con
 *  estos textos (medido a 1280×720, 1366×768, 1440×900, 1536×864 y
 *  1920×1080): si cambia el copy, se reafina. Las laterales tienen tope: la caja de la 02 y la 06 no puede
 *  pasar del borde derecho de la hoja, ni la de la 04 y la 08 del
 *  izquierdo. */
const ANCHO_CH: ReadonlyArray<number> = [46, 39, 36, 37, 46, 40, 49, 37, 44];

/** Jerarquía: nombre en Manrope, grande y apretado; cuerpo en Inter, un
 *  tono más bajo; la frase clave en peso medio con el subrayado verde.
 *  Cuerpos de lectura, no de rótulo (Facundo, 2026-09-12: «que los textos
 *  predominen e inviten a leer»), y un poco más grandes desde el
 *  2026-09-14: el nombre pasó de 1.4 a 1.6 rem y el texto de 1.05 a 1.18. */
const TIPO = {
  nombre: { fontSize: "clamp(1.45rem, 2.85svh, 1.65rem)", lineHeight: 1.15 } satisfies CSSProperties,
  texto: { fontSize: "clamp(1.1rem, 2.1svh, 1.2rem)", lineHeight: 1.6 } satisfies CSSProperties,
  remate: { fontSize: "clamp(1.25rem, 2.4svh, 1.5rem)", lineHeight: 1.45 } satisfies CSSProperties,
  titulo: { fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 } satisfies CSSProperties,
} as const;

/** El texto con su frase clave marcada: el subrayado verde es un span
 *  aparte para poder dibujarlo con scaleX (el `Highlight` de los títulos
 *  usa text-decoration, que no se anima con transform). */
function ConClave({ texto, clave }: { texto: string; clave: string }) {
  const i = texto.indexOf(clave);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark className="text-azul-principal relative bg-transparent font-medium whitespace-nowrap">
        {clave}
        <span
          data-anot-subrayado
          aria-hidden="true"
          className="bg-verde-concepto absolute inset-x-0 -bottom-[0.1em] h-[0.12em]"
        />
      </mark>
      {texto.slice(i + clave.length)}
    </>
  );
}

/** Una anotación de la lámina, colgada de su nodo por la guía. El número
 *  no se repite: vive en el rótulo del SVG. GSAP anima el bloque interior
 *  y sus partes (anotacion-espiral.ts). */
function Anotacion({ indice, children }: { indice: number; children: ReactNode }) {
  const { lado } = ANOTACIONES[indice];
  return (
    <div className="absolute" style={cajaDeAncla(lado, posicionAnotacion(indice))}>
      <div
        data-espiral-anotacion=""
        data-lado={lado}
        className={`text-left ${CAJA[lado]}`}
        style={{ width: `${ANCHO_CH[indice]}ch`, fontSize: TIPO.texto.fontSize }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * La lámina: la escena live de la hoja 03. Figura bajo la cámara, centrada
 * en la hoja (las anotaciones de la vuelta interior cuelgan parejo arriba y
 * abajo; el desbalance del plano general lo absorbe la cámara, ver
 * ENCUADRE_GENERAL); anotaciones colgadas de los nodos; y el rincón
 * narrador arriba a la izquierda, por debajo del header flotante, con UNA
 * sola voz: el título
 * de la hoja, que se va cuando el personaje arranca. Antes tenía tres
 * (título, nota de la bisagra, «Implementar no es terminar»); Facundo
 * (2026-09-12) pidió que al empezar el recorrido vuelen todos los títulos
 * y la figura quede sola con sus anotaciones. Todo lo que se mueve lo
 * mueve coreografia-espiral.ts.
 */
export function EspiralLamina() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center">
      {/* El rincón narrador. */}
      <div className="absolute top-[5.5rem] left-8 z-10 w-[min(34rem,40vw)]">
        <h2
          data-espiral-voz
          className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
          style={TIPO.titulo}
        >
          Cómo una <Highlight>experiencia</Highlight> se convierte en transformación.
        </h2>
      </div>

      {/* La figura, con la relación del viewBox; las anotaciones se
          posicionan en % de este cuadro. Presupuesto vertical: la
          anotación 01 necesita ~130 px sobre su ancla y quedar bajo el
          header flotante; la 07, ~130 px bajo la suya. La figura cedió
          alto (de 62 a 54 svh) para dárselo al texto. Antes iba 15 svh más
          arriba del centro, guardándole lugar al título: con el título en
          el rincón y las notas parejas, el conjunto quedaba 62 px alto
          (Facundo, 2026-09-14: «más centrado en la pantalla»). */}
      <div
        data-espiral-figura
        className="relative aspect-[400/480] overflow-visible"
        style={{ height: "clamp(340px, 54svh, 560px)" }}
      >
        <EspiralSvg lamina />
        {ESTACIONES_EN_ORDEN.map((e, i) => (
          <Anotacion key={e.nombre} indice={i}>
            <h3 data-anot-nombre className="font-display font-bold tracking-[-0.01em]" style={TIPO.nombre}>
              {e.nombre}
            </h3>
            <p data-anot-texto className="text-azul-principal/80 mt-2.5" style={TIPO.texto}>
              <ConClave texto={e.breve} clave={e.clave} />
            </p>
          </Anotacion>
        ))}
        <Anotacion indice={INDICE_REMATE}>
          <p data-anot-texto className="font-display font-medium" style={TIPO.remate}>
            {REMATE_TEXTO}
          </p>
        </Anotacion>
        {/* Ancla interna: Volvemos a investigar vive en la segunda vuelta. */}
        <span id="evidencia" aria-hidden="true" />
      </div>
    </div>
  );
}
