import type { Lecturas } from "./comun";

// Un mensaje no lleva a ningún lado: pudo haberse borrado, a mano o por la
// retención.
export const DE_LOS_MENSAJES = {
  "tomo-un-mensaje": { modulo: "mensajes" },
  "cerro-un-mensaje": { modulo: "mensajes" },
  "marco-un-mensaje-como-spam": { modulo: "mensajes" },
  "borro-un-mensaje": { modulo: "mensajes" },
  "borro-un-cv": { modulo: "mensajes" },
} satisfies Lecturas;
