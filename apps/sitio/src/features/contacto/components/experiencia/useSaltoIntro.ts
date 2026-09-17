import { useEffect, type RefObject } from "react";
import type { Estado } from "./contexto";

/**
 * Mientras la intro corre, cualquier intento de scroll la saltea. Estos
 * handlers son los que reemplazan al lock: en captura, el evento se consume
 * ANTES de llegarle a Lenis (si no, acumula el impulso y arrastra la página
 * en pleno vuelo, con los ghosts fixed clavados en su destino viejo).
 *
 * El `scroll` va aparte y sin preventDefault (no es cancelable): es la red
 * para lo que wheel/touch no cubren — arrastrar la barra, autoscroll del
 * botón del medio. Ahí no se puede evitar el desplazamiento, así que la
 * intro se saltea y el usuario sigue scrolleando, que es lo que pidió.
 *
 * Apenas termina (introListo) los listeners se van y el scroll vuelve a ser
 * scroll: el peaje no se reemplaza por otro peaje.
 */
export function useSaltoIntro(
  reduced: boolean,
  introListo: boolean,
  estado: RefObject<Estado>,
  saltarIntro: () => void,
) {
  useEffect(() => {
    if (reduced || introListo) return;
    const saltar = (e: Event) => {
      if (!estado.current.introVivo) return;
      e.preventDefault();
      e.stopPropagation();
      saltarIntro();
    };
    const onScroll = () => {
      if (estado.current.introVivo) saltarIntro();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!estado.current.introVivo) return;
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault();
        saltarIntro();
      }
    };
    window.addEventListener("wheel", saltar, { capture: true, passive: false });
    window.addEventListener("touchmove", saltar, { capture: true, passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", saltar, { capture: true });
      window.removeEventListener("touchmove", saltar, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
    // Solo cambia con la intro: `saltarIntro` se rehace en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, introListo]);
}
