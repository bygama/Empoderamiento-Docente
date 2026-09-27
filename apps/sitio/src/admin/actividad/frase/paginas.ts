import type { Frases } from "./comun";

/** El nombre de la página, que las acciones anotan en `sobre`; sin él, «una página». */
const pagina = (sobre: string | null | undefined) => sobre ?? "una página";

export const DE_LAS_PAGINAS = {
  "publico-una-pagina": ({ quien, sobre }) => `${quien} publicó ${pagina(sobre)}`,
  "descarto-un-borrador": ({ quien, sobre }) => `${quien} descartó el borrador de ${pagina(sobre)}`,
  "restauro-una-version": ({ quien, sobre }) => `${quien} restauró una versión de ${pagina(sobre)}`,
} satisfies Frases;
