"use client";

import { Boton } from "@/admin/armazon/Boton";
import { useCopiar } from "@/lib/hooks/useCopiar";

/**
 * «Copiar» un link: el botón secundario dice «Copiado» un momento, y el
 * lector oye la frase entera en un `role="status"` aparte.
 */
export function Copiar({ texto, que }: { texto: string; que: string }) {
  const { copiado, copiar } = useCopiar();
  return (
    <>
      <Boton variante="secundario" onClick={() => void copiar(texto, que)} aria-label={`Copiar el link ${que}`}>
        {copiado ? "Copiado" : "Copiar"}
      </Boton>
      <span role="status" className="sr-only">
        {copiado ? `Se copió el link ${que}.` : ""}
      </span>
    </>
  );
}
