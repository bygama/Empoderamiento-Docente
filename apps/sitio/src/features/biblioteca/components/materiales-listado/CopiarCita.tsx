"use client";

import { useEffect, useState } from "react";

/** Cuánto dice «Cita copiada» antes de volver a ofrecer copiarla. */
const AVISO_MS = 2500;

/**
 * «Copiar cita APA» (SPEC §13.1 de `work/biblioteca/`): un botón de texto en
 * la línea de la fecha, que copia la cita del material. Con el estilo de
 * «Limpiar todo» de los filtros (`gris-texto` subrayado, 4,83:1), y no
 * naranja: el naranja es la acción de la fila. Lo que pasó se anuncia aparte,
 * en un `role="status"`, así el lector lo oye aunque el foco siga en el botón.
 * Si el navegador no deja copiar, la cita aparece debajo, seleccionable de un
 * toque, para copiarla a mano.
 */
export function CopiarCita({ cita }: { cita: string }) {
  const [estado, setEstado] = useState<"quieto" | "copiada" | "fallo">("quieto");

  useEffect(() => {
    if (estado !== "copiada") return;
    const vuelta = window.setTimeout(() => setEstado("quieto"), AVISO_MS);
    return () => window.clearTimeout(vuelta);
  }, [estado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cita);
      setEstado("copiada");
    } catch {
      setEstado("fallo");
    }
  };

  let anuncio = "";
  if (estado === "copiada") anuncio = "La cita APA se copió.";
  else if (estado === "fallo") anuncio = "Este navegador no deja copiar: la cita está debajo, para copiarla a mano.";

  return (
    <>
      <button
        type="button"
        onClick={copiar}
        className="text-gris-texto hover:text-azul-principal focus-visible:outline-verde-concepto rounded-sm font-sans text-[0.83rem] underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {estado === "copiada" ? "Cita copiada" : "Copiar cita APA"}
      </button>
      <span role="status" className="sr-only">
        {anuncio}
      </span>
      {estado === "fallo" ? <span className="text-azul-principal/80 basis-full font-sans text-[0.83rem] leading-snug select-all">{cita}</span> : null}
    </>
  );
}
