import gsap from "gsap";
import type { Dispatch, SetStateAction } from "react";
import { getLenis } from "@/lib/lenis";
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

/** El envío del formulario: si está viajando y, si falló, qué decir. */
export type Envio = { enviando: boolean; error: string | null };

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
  setEnvio: Dispatch<SetStateAction<Envio>>;
};

/** El panel de una vista, acotado al root de la experiencia. */
export function panelDe(c: Contexto, v: Vista) {
  return c.root?.querySelector<HTMLElement>(`[data-panel="${v}"]`) ?? null;
}

/**
 * Cambia de vista con la página arriba, sin que se note el salto. Cada estado
 * arranca desde el tope (si no, el formulario aparecería a la altura a la que
 * se había scrolleado el índice), pero el panel que sale todavía se está
 * apagando: llevar la página arriba a secas lo movería de golpe. Por eso se
 * lo corre hacia arriba lo mismo que baja el scroll, en el mismo cuadro: queda
 * clavado donde estaba mientras su coreografía lo disuelve. El corrimiento se
 * limpia cuando ese panel vuelve a entrar.
 *
 * Vale para todos los tamaños: una notebook baja scrollea igual que un
 * celular, y por eso las coreografías son una sola.
 */
export function pasarA(c: Contexto, desde: Vista, hacia: Vista) {
  const bajado = window.scrollY;
  c.setVista(hacia);
  gsap.set(panelDe(c, hacia), { clearProps: "transform" });
  if (bajado <= 0) return;
  gsap.set(panelDe(c, desde), { y: -bajado });
  getLenis()?.scrollTo(0, { immediate: true, force: true });
  // Lenis no se mueve si cree que ya está arriba (se entera del scroll nativo
  // un cuadro después): el salto no puede depender de eso.
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
}

