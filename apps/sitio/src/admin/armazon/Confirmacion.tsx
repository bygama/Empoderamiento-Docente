"use client";

import { useId } from "react";
import { Boton } from "@ed/kit-admin";

type Props = {
  /** Qué se va a hacer y que no vuelve: «¿Borrar el mensaje para siempre?». */
  pregunta: string;
  /** El botón que lo hace: «Sí, borrar». */
  confirmar: string;
  /** Mientras corre: «Borrando…». */
  corriendo: string | null;
  alConfirmar: () => void;
  alCancelar: () => void;
};

/**
 * Confirmar lo que no se deshace (DESIGN.md §11): en el lugar del botón que
 * lo pidió, la pregunta en `rojo-error` (6,57:1) con un borde izquierdo del
 * mismo color, «Sí, …» destructivo y «Cancelar» terciario. Sin diálogo del
 * navegador, que no se puede estilar y frena todo. Al aparecer, el foco va a
 * «Cancelar», lo seguro, que lleva la pregunta como descripción: el lector la
 * lee entera. No sabe de ED.
 */
export function Confirmacion({ pregunta, confirmar, corriendo, alConfirmar, alCancelar }: Props) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      ref={(grupo) => grupo?.querySelector<HTMLButtonElement>("[data-cancelar]")?.focus()}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-rojo-error pl-3"
    >
      <span id={id} className="text-admin-meta font-medium text-rojo-error">
        {pregunta}
      </span>
      <Boton variante="destructivo" onClick={alConfirmar} disabled={Boolean(corriendo)} aria-busy={corriendo ? true : undefined}>
        {corriendo ?? confirmar}
      </Boton>
      <Boton variante="terciario" data-cancelar onClick={alCancelar} disabled={Boolean(corriendo)} aria-describedby={id}>
        Cancelar
      </Boton>
    </div>
  );
}
