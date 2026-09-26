// Un campo que no pasa, dicho para quien edita (SPEC §7.1 de
// `work/paginas-inicio/`). Sin Zod a propósito: lo arma el servidor
// (problemas.ts) y lo junta el editor en el navegador. Sin ED.

/** `camino` es el del formulario («quienesSomos.cuerpo»); `donde`, el mismo en etiquetas («¿Quiénes somos? › Texto»). */
export type ErrorDeCampo = { camino: string; donde: string; mensaje: string };

/** «Hay 2 campos para revisar. El primero: ¿Quiénes somos? › Texto — Falta cerrar un resaltado…». */
export function resumenDeErrores(errores: readonly ErrorDeCampo[]): string {
  const [primero] = errores;
  if (!primero) return "Hay un dato que no pasa.";
  const cuantos = errores.length === 1 ? "Hay un campo para revisar" : `Hay ${errores.length} campos para revisar. El primero`;
  return `${cuantos}: ${primero.donde} — ${primero.mensaje}`;
}
