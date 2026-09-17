import gsap from "gsap";
import type { Dispatch, SetStateAction } from "react";
import type { Tema, TemaKey, Vista } from "./data";

/**
 * Estado mutable de la experiencia que NO dispara renders (timelines en
 * curso, la intro viva, los ghosts). Vive en un solo `useRef` del compositor.
 */
export type Estado = {
  animando: boolean;
  introVivo: boolean;
  introTl: gsap.core.Timeline | null;
  desarmeTl: gsap.core.Timeline | null;
  /** Los ghosts viven en <body> (position:fixed), fuera del ctx de GSAP. */
  ghosts: HTMLElement[];
};

/**
 * Lo que las coreografías necesitan del compositor. Se arma en el momento de
 * usarlo — dentro de handlers y efectos, nunca en render: ahí no se leen refs.
 */
export type Contexto = {
  root: HTMLElement | null;
  estado: Estado;
  reduced: boolean;
  /** Índice del tema elegido (0 si no hay): a su tarjeta vuelve el foco. */
  temaIdx: number;
  temaActivo: Tema | undefined;
  setVista: Dispatch<SetStateAction<Vista>>;
  setTema: Dispatch<SetStateAction<TemaKey | null>>;
  setIntroListo: Dispatch<SetStateAction<boolean>>;
  setMensajeListo: Dispatch<SetStateAction<string>>;
};

/** El panel de una vista, acotado al root de la experiencia. */
export function panelDe(c: Contexto, v: Vista) {
  return c.root?.querySelector<HTMLElement>(`[data-panel="${v}"]`) ?? null;
}

