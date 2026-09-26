import type { EstadoDePagina } from "@/datos/consultas/editor-de-paginas";

/** «7 páginas · 2 con cambios sin publicar», o solo «7 páginas» si no hay nada sin publicar. */
export function resumenDePaginas(filas: ReadonlyArray<{ estado: EstadoDePagina }>): string {
  const total = `${filas.length} ${filas.length === 1 ? "página" : "páginas"}`;
  const sinPublicar = filas.filter((f) => f.estado.borradorEn).length;
  return sinPublicar ? `${total} · ${sinPublicar} con cambios sin publicar` : total;
}
