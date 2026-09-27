import type { Frases } from "./comun";

/** Un material por su título, como era en ese momento; sin él, «un material». */
const material = (sobre: string | null | undefined) => (sobre ? `«${sobre}»` : "un material");

export const DE_LA_BIBLIOTECA = {
  "agrego-un-material": ({ quien, sobre }) => `${quien} agregó el material ${material(sobre)}`,
  "publico-un-material": ({ quien, sobre }) => `${quien} publicó el material ${material(sobre)}`,
  "oculto-un-material": ({ quien, sobre }) => `${quien} ocultó el material ${material(sobre)}`,
  "descarto-cambios-de-un-material": ({ quien, sobre }) => `${quien} descartó los cambios del material ${material(sobre)}`,
  "borro-un-material": ({ quien, sobre }) => `${quien} borró el material ${material(sobre)}`,
} satisfies Frases;
