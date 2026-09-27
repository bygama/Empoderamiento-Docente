import type { Lectura, Lecturas } from "./comun";

/** Una página no se borra: lleva siempre a su editor. */
const deUnaPagina: Lectura = { modulo: "contenido", pantalla: (slug) => ({ href: `/admin/contenido/paginas/${slug}`, que: "Ver la página" }) };

export const DE_LAS_PAGINAS = {
  "publico-una-pagina": deUnaPagina,
  "descarto-un-borrador": deUnaPagina,
  "restauro-una-version": deUnaPagina,
} satisfies Lecturas;
