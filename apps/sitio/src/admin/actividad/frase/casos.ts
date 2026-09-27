import { contraer, type Frases } from "./comun";

/** Un caso, que se anota como se llama en la lista («Caso 01»): «el caso 01». */
const caso = (sobre: string | null | undefined) => (sobre ? `el ${sobre.charAt(0).toLowerCase()}${sobre.slice(1)}` : "un caso");

export const DE_LOS_CASOS = {
  "publico-un-caso": ({ quien, sobre }) => `${quien} publicó ${caso(sobre)}`,
  "descarto-cambios-de-un-caso": ({ quien, sobre }) => `${quien} descartó los cambios ${contraer("de", caso(sobre))}`,
} satisfies Frases;
