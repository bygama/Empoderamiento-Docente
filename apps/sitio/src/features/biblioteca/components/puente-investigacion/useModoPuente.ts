import { useState } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

export type ModoPuente = "quieto" | "vivo" | "movil";

/**
 * Decide el modo del puente a Investigación (escritorio "vivo" con GSAP
 * pineado, "movil" con la pila estática apilable, o "quieto" sin animar) y
 * lo recalcula cuando cambia el viewport: rotar el dispositivo o achicar la
 * ventana puede cruzar cualquiera de las dos media queries, así que ambas
 * se escuchan con `change` y no solo se leen una vez al montar.
 */
export function useModoPuente(reduced: boolean): ModoPuente {
  const [modo, setModo] = useState<ModoPuente>("quieto");

  useIsomorphicLayoutEffect(() => {
    // 1024, no 768: cada lomo mide 52px mínimo, así que los 4 se comen 208px.
    // En tablet el panel abierto quedaba con ~180px por columna y el texto se
    // amontonaba contra la foto. Abajo de eso va la pila estática.
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 1024px)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    const decidir = () => {
      if (reduced) setModo("quieto");
      else if (mqVivo.matches) setModo("vivo");
      else if (mqMovil.matches) setModo("movil");
      else setModo("quieto");
    };
    decidir();
    mqVivo.addEventListener("change", decidir);
    mqMovil.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqMovil.removeEventListener("change", decidir);
    };
  }, [reduced]);

  return modo;
}
