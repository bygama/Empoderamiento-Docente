import type { Cambio } from "@ed/kit-admin";
import type { PersonaEnElFormulario, RecorridoEnElFormulario } from "./formulario";

// Lo que reciben los bloques del formulario de un perfil: lo que hay, cómo
// cambiarlo y los errores del guardado, por el camino de cada campo.

/** Cambiar un campo del formulario de un perfil. */
export type CambiarPerfil = <K extends keyof PersonaEnElFormulario>(campo: K, cambio: Cambio<PersonaEnElFormulario[K]>) => void;

export type PropsDeBloque = { form: PersonaEnElFormulario; cambiar: CambiarPerfil; errores: Readonly<Record<string, string>> };

/** Lo mismo, adentro del recorrido: los bloques que solo existen con él. */
export type CambiarRecorrido = <K extends keyof RecorridoEnElFormulario>(campo: K, cambio: Cambio<RecorridoEnElFormulario[K]>) => void;

export type PropsDelRecorrido = { recorrido: RecorridoEnElFormulario; cambiar: CambiarRecorrido; errores: Readonly<Record<string, string>> };
