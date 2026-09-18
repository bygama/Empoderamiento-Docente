import { useRef } from "react";

/**
 * Los refs de la torre, en un solo bundle: el compositor los reparte al JSX
 * y se los pasa enteros al pintor y al armado (que los leen en fase de
 * layout, nunca en render).
 *
 * Las matrices por tambor arrancan VACÍAS y cada callback-ref crea su fila
 * al vuelo (`(spans.current[i] ??= [])[j] = el`, igual que los aros): así no
 * se vacían en el cuerpo del componente —mutar un ref durante el render, que
 * un render descartado dejaba sin repoblar— ni se reconstruye una matriz por
 * render (el inicializador de `useRef` corre en cada uno aunque se descarte).
 *
 * OJO con las deps: el objeto que devuelve es NUEVO en cada render (los `useRef`
 * de adentro no, esos son estables). El efecto que arma la coreografía lo usa
 * pero NO lo lista en sus deps, a propósito: agregarlo rearmaría la torre entera
 * en cada render. `exhaustive-deps` no lo ve porque `useIsomorphicLayoutEffect`
 * es un alias propio que la regla no inspecciona — o sea que acá no hay red.
 */
export function useRefsTorre() {
  return {
    zone: useRef<HTMLDivElement | null>(null),
    stage: useRef<HTMLDivElement | null>(null),
    tower: useRef<HTMLDivElement | null>(null),
    drums: useRef<(HTMLDivElement | null)[]>([]),
    spans: useRef<(HTMLSpanElement | null)[][]>([]),
    fotos: useRef<(HTMLDivElement | null)[]>([]),
    chips: useRef<(HTMLDivElement | null)[][]>([]),
    aros: useRef<(HTMLDivElement | null)[][]>([]),
    titulo: useRef<HTMLParagraphElement | null>(null),
    frase: useRef<HTMLParagraphElement | null>(null),
    detalle: useRef<HTMLParagraphElement | null>(null),
    apoyo: useRef<HTMLDivElement | null>(null),
    rail: useRef<(HTMLButtonElement | null)[]>([]),
    fill: useRef<HTMLSpanElement | null>(null),
    pct: useRef<HTMLSpanElement | null>(null),
    velo: useRef<HTMLSpanElement | null>(null),
    rotulo: useRef<HTMLParagraphElement | null>(null),
    nav: useRef<HTMLElement | null>(null),
    rielDer: useRef<HTMLDivElement | null>(null),
    superficie: useRef<HTMLSpanElement | null>(null),
    niebla: useRef<(HTMLSpanElement | null)[]>([]),
  };
}

export type RefsTorre = ReturnType<typeof useRefsTorre>;
