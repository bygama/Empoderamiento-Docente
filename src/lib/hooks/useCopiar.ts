"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Copiar al portapapeles con confirmación breve. `copiado` guarda qué se
 * copió (la etiqueta que se pase) durante un ratito, para que el botón pueda
 * decir «Copiado» y volver solo. Si el navegador no da el portapapeles (http
 * sin https, iframe), muestra el texto en un prompt para copiarlo a mano.
 */
export function useCopiar(duracionMs = 1800) {
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(null), duracionMs);
    return () => window.clearTimeout(t);
  }, [copiado, duracionMs]);

  const copiar = useCallback(async (texto: string, etiqueta = "texto") => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(etiqueta);
    } catch {
      window.prompt("Copiá el texto:", texto);
    }
  }, []);

  return { copiado, copiar };
}
