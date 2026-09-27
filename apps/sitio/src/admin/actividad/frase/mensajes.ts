import type { Frases } from "./comun";

/**
 * Un mensaje de Contacto por su tema, que es lo único que se anota de él
 * («sobre Investigación»); sin tema, «de Contacto».
 */
const mensaje = (sobre: string | null | undefined) => (sobre && sobre !== "Contacto" ? `un mensaje sobre ${sobre}` : "un mensaje de Contacto");

export const DE_LOS_MENSAJES = {
  "tomo-un-mensaje": ({ quien, sobre }) => `${quien} tomó ${mensaje(sobre)}`,
  "cerro-un-mensaje": ({ quien, sobre }) => `${quien} cerró ${mensaje(sobre)}`,
  // Lo que se borra o es spam no repite su tema: de eso, solo que pasó.
  "marco-un-mensaje-como-spam": ({ quien }) => `${quien} marcó un mensaje como spam`,
  "borro-un-mensaje": ({ quien }) => `${quien} borró un mensaje de Contacto`,
  "borro-un-cv": ({ quien }) => `${quien} borró un CV`,
} satisfies Frases;
