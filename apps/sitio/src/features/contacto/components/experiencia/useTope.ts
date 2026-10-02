import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import type { Vista } from "./data";

/**
 * Los paneles van en el flujo y, si no entran en la pantalla, scrollea la
 * página: cada estado arranca con la página arriba (si no, el formulario
 * aparecía a la altura a la que se había scrolleado la apertura). Vale para
 * todos los tamaños: una notebook baja scrollea igual que un celular.
 *
 * Salir del hero no cuenta: la intro retiene el scroll, y si se salteó
 * arrastrando la barra, llevar la página arriba sería pelearle el gesto a
 * quien lo está haciendo.
 */
export function useTope(vista: Vista): void {
  const anterior = useRef(vista);
  useEffect(() => {
    const desde = anterior.current;
    anterior.current = vista;
    if (desde === vista || desde === "hero") return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [vista]);
}
