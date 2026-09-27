import type { Frases } from "./comun";

/** Una novedad por su título, como era en ese momento; sin él, «una novedad». */
const novedad = (sobre: string | null | undefined) => (sobre ? `«${sobre}»` : "una novedad");

export const DE_LAS_NOVEDADES = {
  "publico-una-novedad": ({ quien, sobre }) => `${quien} publicó la novedad ${novedad(sobre)}`,
  "despublico-una-novedad": ({ quien, sobre }) => `${quien} despublicó la novedad ${novedad(sobre)}`,
  "descarto-cambios-de-una-novedad": ({ quien, sobre }) => `${quien} descartó los cambios de la novedad ${novedad(sobre)}`,
  "borro-una-novedad": ({ quien, sobre }) => `${quien} borró la novedad ${novedad(sobre)}`,
} satisfies Frases;
