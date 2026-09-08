import { useRef } from "react";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Los refs del perfil inmersivo, en un solo bundle: el compositor los reparte
 * al JSX y se los pasa enteros a la coreografía (que los lee en fase de
 * layout, nunca en render).
 */
export function useRefsPerfil() {
  return {
    wrap: useRef<HTMLDivElement | null>(null),
    identity: useRef<HTMLDivElement | null>(null),
    idLine1: useRef<HTMLSpanElement | null>(null),
    idLine2: useRef<HTMLSpanElement | null>(null),
    idRole: useRef<HTMLSpanElement | null>(null),
    clone: useRef<HTMLDivElement | null>(null),
    cloneL1: useRef<HTMLSpanElement | null>(null),
    cloneL2: useRef<HTMLSpanElement | null>(null),
    cloneRole: useRef<HTMLSpanElement | null>(null),
    hero: useRef<HTMLElement | null>(null),
    heroBody: useRef<HTMLDivElement | null>(null),
    sidebar: useRef<HTMLElement | null>(null),
    portraitOuter: useRef<HTMLDivElement | null>(null),
    portraitMover: useRef<HTMLDivElement | null>(null),
    track: useRef<HTMLDivElement | null>(null),
    path: useRef<SVGPathElement | null>(null),
    svg: useRef<SVGSVGElement | null>(null),
    closing: useRef<HTMLElement | null>(null),
    closingFig: useRef<HTMLDivElement | null>(null),
  };
}

export type RefsPerfil = ReturnType<typeof useRefsPerfil>;

/** Vars de ScrollTrigger con el scroller del overlay ya puesto. */
export type St = <T extends ScrollTrigger.Vars>(v: T) => T & { scroller: HTMLElement };
