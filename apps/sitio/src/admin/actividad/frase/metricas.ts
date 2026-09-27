import type { Frases } from "./comun";

/** «el link «Taller»»; sin nombre, «un link»: lo nombrado entre comillas, como una novedad. */
const entre = (que: "el link" | "la marca", sobre: string | null | undefined) =>
  sobre ? `${que} «${sobre}»` : que === "el link" ? "un link" : "una marca";

// El link por su nombre, la marca por su texto.
export const DE_LAS_METRICAS = {
  "creo-un-enlace": ({ quien, sobre }) => `${quien} creó ${entre("el link", sobre)}`,
  "borro-un-enlace": ({ quien, sobre }) => `${quien} borró ${entre("el link", sobre)}`,
  "agrego-una-marca": ({ quien, sobre }) => `${quien} agregó ${entre("la marca", sobre)}`,
  "borro-una-marca": ({ quien, sobre }) => `${quien} borró ${entre("la marca", sobre)}`,
} satisfies Frases;
