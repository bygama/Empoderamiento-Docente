import type { Frases } from "./comun";

/** Un perfil del Equipo por el nombre de la persona, como era en ese momento; sin él, «una persona del equipo». */
const perfil = (sobre: string | null | undefined) => sobre ?? "una persona del equipo";

export const DEL_EQUIPO = {
  "publico-un-perfil": ({ quien, sobre }) => `${quien} publicó el perfil de ${perfil(sobre)}`,
  "despublico-un-perfil": ({ quien, sobre }) => `${quien} despublicó el perfil de ${perfil(sobre)}`,
  "descarto-cambios-de-un-perfil": ({ quien, sobre }) => `${quien} descartó los cambios del perfil de ${perfil(sobre)}`,
  "borro-un-perfil": ({ quien, sobre }) => `${quien} borró el perfil de ${perfil(sobre)}`,
  "movio-un-perfil": ({ quien, sobre }) => `${quien} movió a ${perfil(sobre)} en el orden del equipo`,
} satisfies Frases;
