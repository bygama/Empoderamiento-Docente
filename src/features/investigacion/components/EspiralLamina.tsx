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

/** Respiro entre la guía y el texto, y ancho de la caja: las de arriba y
 *  abajo van más anchas para gastar menos alto. Se ensancharon el
 *  2026-09-12 junto con el cuerpo: el texto tiene que mandar sobre la
 *  figura, no colgar de ella en letra chica. */
const CAJA: Record<Lado, string> = {
  arriba: "w-[46ch] pb-3 -ml-3",
  abajo: "w-[42ch] pt-3 -ml-3",
  derecha: "w-[38ch] pl-3",
  izquierda: "w-[38ch] pr-3",
  "arriba-derecha": "w-[40ch] pb-2 pl-1",
};

/** Jerarquía: nombre en Manrope, grande y apretado; cuerpo en Inter, un
 *  tono más bajo; la frase clave en peso medio con el subrayado verde.
 *  Cuerpos de lectura, no de rótulo (Facundo, 2026-09-12: «que los textos
 *  predominen e inviten a leer»): el nombre pasó de 1.1 a 1.4 rem y el
 *  texto de 0.9 a 1.05, con más interlineado. */
const TIPO = {
  nombre: { fontSize: "clamp(1.3rem, 2.6svh, 1.5rem)", lineHeight: 1.15 } satisfies CSSProperties,
  texto: { fontSize: "clamp(1rem, 1.9svh, 1.1rem)", lineHeight: 1.6 } satisfies CSSProperties,
  remate: { fontSize: "clamp(1.15rem, 2.2svh, 1.4rem)", lineHeight: 1.45 } satisfies CSSProperties,
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
      <div data-espiral-anotacion="" data-lado={lado} className={`text-left ${CAJA[lado]}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * La lámina: la escena live de la hoja 03. Figura bajo la cámara, un poco
 * arriba del centro para que las anotaciones de abajo tengan lugar;
 * anotaciones colgadas de los nodos; y el rincón narrador arriba a la
 * izquierda, por debajo del header flotante, con UNA sola voz: el título
 * de la hoja, que se va cuando el personaje arranca. Antes tenía tres
 * (título, nota de la bisagra, «Implementar no es terminar»); Facundo
 * (2026-09-12) pidió que al empezar el recorrido vuelen todos los títulos
 * y la figura quede sola con sus anotaciones. Todo lo que se mueve lo
 * mueve coreografia-espiral.ts.
 */
export function EspiralLamina() {
  return (
    <div className="relative flex flex-1 flex-col items-center">
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
          alto (de 62 a 54 svh) para dárselo al texto. */}
      <div
        data-espiral-figura
        className="relative mt-[clamp(8rem,15svh,9.5rem)] aspect-[400/480] overflow-visible"
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
