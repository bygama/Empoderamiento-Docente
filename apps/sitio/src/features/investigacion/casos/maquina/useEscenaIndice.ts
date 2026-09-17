import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { escenaIndice } from "../coreografia-indice";
import type { Maquina } from "./useLugarExpediente";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── La escena del índice en desktop con puntero (2026-09-14):
 *    título grande que se achica hasta su esquina y pila que aparece
 *    después (coreografia-indice.ts). Vive mientras el índice
 *    está montado —también durante la apertura y el cierre, cuando la
 *    carpeta viaja sobre él— y se revierte recién cuando el expediente ya
 *    está establecido y el telón es opaco: revertirla antes sacaría la
 *    altura de la pista y la pila saltaría a la vista. Al remontar el
 *    índice (cierre) se vuelve a crear en el mismo layout effect, antes de
 *    que la transición mida la banda de destino. ────────────────────── */
export function useEscenaIndice(m: Maquina, indiceVisible: boolean) {
  const { reduced, sectionRef } = m;
  useIsomorphicLayoutEffect(() => {
    if (reduced || !indiceVisible) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const pista = q<HTMLElement>("[data-casos-pista]")[0];
    const escena = q<HTMLElement>("[data-casos-escena]")[0];
    const titulo = q<HTMLElement>("[data-casos-titulo]")[0];
    const pila = q<HTMLElement>("[data-casos-pila]")[0];
    if (!pista || !escena || !titulo || !pila) return;

    const ctx = gsap.context(() => {
      const tl = escenaIndice({ pista, escena, titulo, pila });
      // La pista cambió de alto: lo de abajo se reubica. Y la escena
      // arranca ya en su progreso (al remontar, el lector suele estar
      // sobre la pila): sin esto el scrub suavizado la tweenearía desde
      // cero.
      ScrollTrigger.refresh();
      const st = tl.scrollTrigger;
      if (st) tl.progress(st.progress);
    }, section);
    return () => ctx.revert();
  }, [reduced, indiceVisible]);
}
