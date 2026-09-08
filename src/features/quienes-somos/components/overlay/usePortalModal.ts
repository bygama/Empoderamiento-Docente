import type { RefObject } from "react";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { getLenis } from "@/lib/lenis";

type Opciones = {
  /** El nodo del portal (creado una vez en el compositor). */
  container: HTMLDivElement | null;
  rootRef: RefObject<HTMLDivElement | null>;
  /** Primer foco del diálogo (el botón de volver). */
  backRef: RefObject<HTMLButtonElement | null>;
  /** La card que abrió el perfil: recibe el foco de vuelta al cerrar. */
  originEl: HTMLElement | null;
  /**
   * Entrada del overlay: corre con el portal ya en el DOM, visible y
   * enfocado. Devuelve su limpieza, que corre PRIMERA al cerrar (antes de
   * quitar inert, sacar el portal, devolver el foco y restaurar el scroll).
   */
  entrar: (root: HTMLDivElement | null) => () => void;
  /** Con `container` y `originEl`, lo que remonta el portal entero. */
  reduced: boolean;
  immersive: boolean;
};

/**
 * Portal + lock de scroll + inert + foco + guardado y restauración del
 * scroll, todo en FASE DE LAYOUT. Adjuntamos el container al document EN
 * FASE DE LAYOUT y ANTES de medir o enfocar. Si viviera en un useEffect
 * pasivo, el hero mediría 0 (FLIP → fade) y focus() sobre un botón
 * desconectado sería no-op (foco perdido).
 */
export function usePortalModal({ container, rootRef, backRef, originEl, entrar, reduced, immersive }: Opciones) {
  useLockScroll(true);

  useIsomorphicLayoutEffect(() => {
    if (!container) return;
    // Congelar el smooth scroll de la página y recordar el punto EXACTO: al
    // cerrar, Lenis + ScrollTrigger.refresh() recalculan con alturas
    // transitorias y sin esto la página "deriva" hacia otra sección.
    const savedY = window.scrollY;
    getLenis()?.stop();
    container.setAttribute("data-team-portal", "");
    document.body.appendChild(container);
    const siblings = Array.from(document.body.children).filter((c) => c !== container) as HTMLElement[];
    siblings.forEach((s) => {
      s.setAttribute("aria-hidden", "true");
      s.setAttribute("inert", "");
    });

    // Root VISIBLE antes de enfocar: `invisible` (visibility:hidden) impide foco.
    const root = rootRef.current;
    if (root) gsap.set(root, { autoAlpha: 1 });
    backRef.current?.focus();

    const salir = entrar(root);

    return () => {
      salir();
      siblings.forEach((s) => {
        s.removeAttribute("aria-hidden");
        s.removeAttribute("inert");
      });
      if (container.parentNode) container.parentNode.removeChild(container);
      // Restaurar foco a la card DESPUÉS de quitar inert (un elemento inert no
      // puede recibir foco). preventScroll conserva el punto de scroll.
      originEl?.focus?.({ preventScroll: true });
      // Restauración DETERMINÍSTICA del scroll: sync inmediato de ventana y
      // Lenis al punto guardado, y re-aserciones tras los refresh async
      // (ResizeObserver del provider → lenis.resize + ScrollTrigger.refresh)
      // que antes hacían derivar la página hacia la sección anterior.
      window.scrollTo(0, savedY);
      const lenis = getLenis();
      lenis?.scrollTo(savedY, { immediate: true, force: true });
      lenis?.start();
      const reassert = () => {
        if (Math.abs(window.scrollY - savedY) <= 1) return;
        window.scrollTo(0, savedY);
        getLenis()?.scrollTo(savedY, { immediate: true, force: true });
      };
      requestAnimationFrame(() => {
        reassert();
        requestAnimationFrame(reassert);
      });
      window.setTimeout(reassert, 180);
    };
  }, [container, originEl, reduced, immersive]);
}
