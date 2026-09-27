import { contraer, type Frases } from "./comun";

/** Un aliado por su nombre: lo que se publica y se autoriza es su logo. */
const aliado = (sobre: string | null | undefined) => (sobre ? `el logo de ${sobre}` : "un logo de aliado");

export const DE_LOS_ALIADOS = {
  "autorizo-un-aliado": ({ quien, sobre }) => `${quien} autorizó ${aliado(sobre)}`,
  "quito-la-autorizacion-de-un-aliado": ({ quien, sobre }) => `${quien} le quitó la autorización ${contraer("a", aliado(sobre))}`,
  "publico-un-aliado": ({ quien, sobre }) => `${quien} publicó ${aliado(sobre)}`,
  "despublico-un-aliado": ({ quien, sobre }) => `${quien} despublicó ${aliado(sobre)}`,
  "borro-un-aliado": ({ quien, sobre }) => `${quien} borró ${aliado(sobre)}`,
} satisfies Frases;
