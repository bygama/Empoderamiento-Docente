import type { Frases } from "./comun";

export const DEL_ACCESO = {
  entro: ({ quien }) => `${quien} entró`,
  salio: ({ quien }) => `${quien} salió`,
} satisfies Frases;
