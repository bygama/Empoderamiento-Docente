import type { Reglas } from "./regla";

// Equipo (work/equipo/): sobre el perfil, con el nombre de la persona como era
// en ese momento y su id. Mover es un paso por clic, y cada paso se anota. Lo
// ve quien edita el contenido.
export const DEL_EQUIPO = {
  "publico-un-perfil": { quienVe: "editarContenido", vaAlInicio: true },
  "despublico-un-perfil": { quienVe: "editarContenido", vaAlInicio: true },
  "descarto-cambios-de-un-perfil": { quienVe: "editarContenido", vaAlInicio: true },
  "borro-un-perfil": { quienVe: "editarContenido", vaAlInicio: true },
  "movio-un-perfil": { quienVe: "editarContenido", vaAlInicio: true },
} as const satisfies Reglas;
