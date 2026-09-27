import type { Frases } from "./comun";

/** Una foto por su texto alternativo, como era en ese momento. */
const foto = (sobre: string | null | undefined) => (sobre ? `la foto «${sobre}»` : "una foto");

export const DE_LAS_FOTOS = {
  "subio-una-foto": ({ quien, sobre }) => `${quien} subió ${foto(sobre)}`,
  "reemplazo-una-foto": ({ quien, sobre }) => `${quien} reemplazó el archivo de ${foto(sobre)}`,
  "borro-una-foto": ({ quien, sobre }) => `${quien} borró ${foto(sobre)}`,
} satisfies Frases;
