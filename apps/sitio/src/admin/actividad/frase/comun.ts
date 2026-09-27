import type { TipoDeActividad } from "@/datos/actividad";

/** Un evento de la tabla `actividad`, con el nombre de quien lo hizo ya puesto. */
export type EventoParaLeer = { tipo: TipoDeActividad; quien: string; sobre?: string | null };

/** Cómo se lee un tipo: un verbo en pasado sobre quien lo hizo, como lo diría una persona. */
export type Frase = (evento: EventoParaLeer) => string;

/** Las frases de un módulo, una por cada tipo que suma. */
export type Frases = Partial<Record<TipoDeActividad, Frase>>;

/** «de» y «a» delante de «el …» se contraen: «del caso 01», «al logo de UNESCO». */
export const contraer = (preposicion: "de" | "a", nombre: string) => (nombre.startsWith("el ") ? `${preposicion}l ${nombre.slice(3)}` : `${preposicion} ${nombre}`);
