import { getLenis } from "@/lib/lenis";

/**
 * Frena el scroll HACIA ABAJO mientras corre la entrada (el usuario,
 * 2026-09-11: «que te bloquee el scroll así cuando aparecen las cards
 * aparecen bien»). Es el bloqueo de la torre de líneas (`torre/armado-torre`):
 * se clava el scroll al comienzo de la sección —eso también corta la inercia
 * de Lenis— y se tragan la rueda y las teclas que bajan; hacia ARRIBA queda
 * libre, quien se arrepiente vuelve al faro y el borde rebobina y suelta.
 *
 * Los listeners van en CAPTURA sobre window y cortan la propagación: así el
 * evento no llega a Lenis (que escucha en burbuja) ni al scroll nativo.
 * Clavar va diferido un frame: quien llama corre adentro de
 * ScrollTrigger.update, y Lenis emite scroll al mover.
 */
export function crearBloqueoScroll(root: HTMLElement) {
  const TECLAS_ABAJO = new Set([" ", "PageDown", "ArrowDown", "End"]);
  const tragar = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const frenarTecla = (e: KeyboardEvent) => {
    // Shift+Espacio sube: se deja pasar.
    if (TECLAS_ABAJO.has(e.key) && !(e.key === " " && e.shiftKey)) tragar(e);
  };
  const frenarRueda = (e: WheelEvent) => {
    if (e.deltaY > 0) tragar(e);
  };

  let bloqueado = false;
  let raf = 0;

  const clavar = () => {
    raf = 0;
    if (bloqueado) return;
    bloqueado = true;
    window.addEventListener("keydown", frenarTecla, { capture: true });
    window.addEventListener("wheel", frenarRueda, { capture: true, passive: false });
    // +4px: en el borde exacto (progreso 0) ScrollTrigger da la sección por
    // inactiva y la apagaría. El faro ya terminó en blanco y esta sección lo
    // tapa opaca, así que el salto no se ve.
    const top = root.getBoundingClientRect().top + window.scrollY + 4;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo(0, top);
  };

  const bloquear = () => {
    if (bloqueado || raf) return;
    raf = requestAnimationFrame(clavar);
  };

  const liberar = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!bloqueado) return;
    bloqueado = false;
    window.removeEventListener("keydown", frenarTecla, { capture: true });
    window.removeEventListener("wheel", frenarRueda, { capture: true });
  };

  return { bloquear, liberar };
}
