import type { CSSProperties, ReactNode } from "react";
import { Highlight } from "@/components/ui/Highlight";
import { EspiralSvg } from "./EspiralSvg";
import {
  BISAGRA_TEXTO,
  REMATE_TEXTO,
  VUELTA_1,
  VUELTA_2,
  type Estacion,
} from "./estaciones";
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
 *  abajo van más anchas para gastar menos alto. */
const CAJA: Record<Lado, string> = {
  arriba: "w-[44ch] pb-3 -ml-3",
  abajo: "w-[38ch] pt-3 -ml-3",
  derecha: "w-[32ch] pl-3",
  izquierda: "w-[32ch] pr-3",
  "arriba-derecha": "w-[36ch] pb-2 pl-1",
};

const TIPO = {
  nombre: { fontSize: "clamp(1rem, 1.9svh, 1.2rem)", lineHeight: 1.2 } satisfies CSSProperties,
  texto: { fontSize: "clamp(0.9rem, 1.65svh, 1rem)", lineHeight: 1.5 } satisfies CSSProperties,
  remate: { fontSize: "clamp(1.05rem, 2svh, 1.3rem)", lineHeight: 1.4 } satisfies CSSProperties,
  titulo: { fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 } satisfies CSSProperties,
  nota: { fontSize: "clamp(1.3rem, 0.8rem + 1.2vw, 1.75rem)", lineHeight: 1.3 } satisfies CSSProperties,
} as const;

/** Una anotación de la lámina, colgada de su nodo por la guía. El número
 *  no se repite: vive en el rótulo del SVG. GSAP anima el bloque interior. */
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
 * izquierda, por debajo del header flotante, con tres voces (título 1,
 * nota de la bisagra, título 2). Todo lo que se mueve lo mueve
 * coreografia-espiral.ts.
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
        <p
          data-espiral-voz
          className="font-display absolute inset-x-0 top-0 max-w-[26ch] font-medium"
          style={TIPO.nota}
        >
          {BISAGRA_TEXTO}
        </p>
        <h2
          data-espiral-voz
          className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
          style={TIPO.titulo}
        >
          Implementar no es <Highlight>terminar</Highlight>.
        </h2>
      </div>

      {/* La figura, con la relación del viewBox; las anotaciones se
          posicionan en % de este cuadro. */}
      {/* Presupuesto vertical: la anotación 01 necesita ~110 px sobre su
          ancla y quedar bajo el header flotante; la 07, ~110 px bajo la suya. */}
      <div
        data-espiral-figura
        className="relative mt-[clamp(8rem,15svh,9.5rem)] aspect-[400/480] overflow-visible"
        style={{ height: "clamp(380px, 62svh, 640px)" }}
      >
        <EspiralSvg lamina />
        {ESTACIONES_EN_ORDEN.map((e, i) => (
          <Anotacion key={e.nombre} indice={i}>
            <h3 className="font-display font-bold" style={TIPO.nombre}>
              {e.nombre}
            </h3>
            <p className="mt-1.5" style={TIPO.texto}>
              {e.breve}
            </p>
          </Anotacion>
        ))}
        <Anotacion indice={INDICE_REMATE}>
          <p className="font-display font-medium" style={TIPO.remate}>
            {REMATE_TEXTO}
          </p>
        </Anotacion>
        {/* Ancla interna: Volvemos a investigar vive en la segunda vuelta. */}
        <span id="evidencia" aria-hidden="true" />
      </div>
    </div>
  );
}
