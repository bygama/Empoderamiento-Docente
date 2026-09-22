"use client";

import { useEffect } from "react";
import { Boton } from "@/admin/armazon/Boton";

/**
 * El admin no tenía límite de error: sin esto, un `listaDePaginas` o un
 * `paginaParaEditar` que tira se llevaría puesta toda la pantalla con el
 * genérico de Next, en inglés y sin salida.
 */
export default function ErrorDePaginas({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-xl border border-azul-claro bg-white p-6">
      <p className="text-gris-texto">No se pudo abrir esta pantalla del admin. Probá de nuevo; si sigue, avisá a quien administra.</p>
      <Boton variante="secundario" onClick={reset}>
        Reintentar
      </Boton>
    </div>
  );
}
