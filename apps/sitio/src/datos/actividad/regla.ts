import type { Capacidad } from "@ed/auth";

/**
 * Lo que un módulo dice de cada tipo de actividad que suma, en una sola
 * entrada, así un tipo nuevo no compila sin las dos cosas:
 *
 * - `quienVe`: qué hay que poder para verlo, en el Inicio y en Cuentas ›
 *   Actividad (la misma regla en los dos lados).
 * - `vaAlInicio`: si va a la actividad reciente del Inicio. Van los que
 *   cambian algo del sitio o del admin; los de la sesión y de la cuenta propia
 *   no, porque taparían lo que el Inicio tiene que contar, y siguen en Cuentas
 *   › Actividad.
 */
export type Regla = { quienVe: Capacidad; vaAlInicio: boolean };

/** Los tipos de un módulo: un verbo en pasado sobre quien lo hizo, y su regla. */
export type Reglas = Record<string, Regla>;

/** Los tipos de unas reglas, en su orden: el de los módulos en el índice. */
export function tiposDe<K extends string>(reglas: Record<K, Regla>): K[] {
  // Object.keys devuelve string[]: el `as` recupera las claves del Record, que son exactamente esas.
  return Object.keys(reglas) as K[];
}

/**
 * Un dato de la regla de cada tipo, como `Record` por tipo: `QUIEN_VE` y
 * `VA_AL_INICIO`, como se exportaban antes de partir el registro.
 */
export function porTipo<K extends string, T>(reglas: Record<K, Regla>, dato: (regla: Regla) => T): Readonly<Record<K, T>> {
  // Object.entries pierde las claves del Record: el `as` las recupera, que son exactamente esas.
  return Object.fromEntries(Object.entries<Regla>(reglas).map(([tipo, regla]) => [tipo, dato(regla)])) as Record<K, T>;
}
