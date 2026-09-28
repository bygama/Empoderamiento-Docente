import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import type { Vista } from "./data";
import { esMovil } from "./movil";

/**
 * En celular los paneles van en el flujo: cada estado arranca con la página
 * arriba (si no, el formulario aparecía a la altura a la que se había
 * scrolleado la apertura). La primera ejecución (al montar, todavía en
 * "hero") se salta: si no, pisa el scroll que el navegador restauró o el
 * salto de una intro salteada por arrastre de barra, antes de que nadie haya
 * cambiado de vista todavía.
 */
export function useTopeMovil(vista: Vista): void {
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (!esMovil()) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [vista]);
}
