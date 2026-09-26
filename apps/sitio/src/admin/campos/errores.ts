import { createContext } from "react";

// Los errores del último guardado, por camino del campo («quienesSomos.cuerpo»,
// «hero.tarjetas.2.foto.alt»: el mismo `nombre` que arma `Campo`). Solo
// `Campo.tsx` lee este contexto: cada control recibe su `error` como una prop
// plana más, para mudarse a kit-admin sin llevarse el generador (AGENTS.md §12).

export type ErroresDelFormulario = {
  errores: Readonly<Record<string, string>>;
  /** Borra los errores de un campo (y de lo que tenga adentro) en cuanto se lo edita. */
  limpiar: (nombre: string) => void;
};

export const ContextoDeErrores = createContext<ErroresDelFormulario>({ errores: {}, limpiar: () => {} });

/** ¿`camino` es `nombre` o está adentro de él? `hero.tarjetas.2.foto.alt` está en `hero.tarjetas.2`. */
export function estaEn(camino: string, nombre: string): boolean {
  return camino === nombre || camino.startsWith(`${nombre}.`);
}

/** El error de un control: el de su camino o el de algo adentro (el alt de una foto). */
export function errorDe(errores: Readonly<Record<string, string>>, nombre: string): string | undefined {
  const camino = Object.keys(errores).find((c) => estaEn(c, nombre));
  return camino === undefined ? undefined : errores[camino];
}
