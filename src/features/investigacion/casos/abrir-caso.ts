import type { MouseEvent } from "react";

/**
 * Pedirle al archivo, desde otra sección de la misma página, que abra un
 * caso: las píldoras «Ver en acción» de las líneas de investigación
 * (LineasInvestigacion) lo disparan y la máquina del archivo lo escucha
 * (maquina/useHistorialLugar.ts): desliza hasta la pila y abre el
 * expediente, como si se hubiera tocado la carpeta. El href de la píldora
 * sigue siendo `#slug`, que es el link directo del caso: abierta en otra
 * pestaña, la página aterriza con el expediente abierto.
 */
export const EVENTO_CASO = "ed:caso";

export function pedirCaso(slug: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENTO_CASO, { detail: slug }));
}

/** onClick de un link `#slug` de la misma página. Con modificadores (nueva
 *  pestaña) no interviene: el link directo hace el resto. */
export function alClicVerCaso(slug: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    pedirCaso(slug);
  };
}
