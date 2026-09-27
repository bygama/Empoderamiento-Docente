import type { Reglas } from "./regla";

// Mensajes (work/mensajes/): de Contacto, con el tema en `sobre`, nunca el
// nombre ni el texto de quien escribió, y lo ve quien ve Contacto; de un CV,
// solo que se borró, sin `sobre`, y lo ve solo quien ve los CV.
export const DE_LOS_MENSAJES = {
  "tomo-un-mensaje": { quienVe: "verContacto", vaAlInicio: true },
  "cerro-un-mensaje": { quienVe: "verContacto", vaAlInicio: true },
  "marco-un-mensaje-como-spam": { quienVe: "verContacto", vaAlInicio: true },
  "borro-un-mensaje": { quienVe: "verContacto", vaAlInicio: true },
  "borro-un-cv": { quienVe: "verCV", vaAlInicio: true },
} as const satisfies Reglas;
