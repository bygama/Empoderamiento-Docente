import { useEffect, type RefObject } from "react";

/**
 * Teclado del diálogo: ESC cierra · Tab atrapado dentro del root. Solo
 * focusables REALMENTE enfocables (visibles): en el inmersivo el botón de
 * cierre puede estar aún oculto por el revelado; si lo dejáramos como
 * `last`, el navegador lo saltearía y el foco escaparía del diálogo. (Se
 * retira cuando el overlay pase a `<dialog>`, que trae ambas cosas.)
 */
export function useTecladoOverlay(rootRef: RefObject<HTMLDivElement | null>, requestClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key === "Tab" && rootRef.current) {
        const focusables = Array.from(
          rootRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rootRef, requestClose]);
}
