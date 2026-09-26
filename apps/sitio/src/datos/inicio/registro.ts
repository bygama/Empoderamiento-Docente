import { puede, type Capacidad } from "@ed/auth";

/**
 * Lo que comparten los registros del Inicio (SPEC de `work/inicio/` §3): cada
 * bloque lee un registro, y cada módulo que llega suma ahí su entrada sin
 * tocar las pantallas. Una entrada tiene su clave, la capacidad que hace falta
 * para verla y una consulta.
 */
export type Entrada<C extends string = string> = { clave: C; capacidad: Capacidad };

/**
 * Un registro guardado como `Record<Clave, …>` (así una clave sin entrada no
 * compila), pasado a lista en su orden, con la clave puesta.
 */
export function enOrden<C extends string, D extends { capacidad: Capacidad }>(registro: Record<C, D>): Array<D & { clave: C }> {
  // Object.keys devuelve string[]: el `as` recupera las claves del Record, que son exactamente esas.
  return (Object.keys(registro) as C[]).map((clave) => ({ ...registro[clave], clave }));
}

/**
 * Las entradas que ese rol puede ver. Se filtra **antes** de consultar: a
 * quien no ve una fila no se le corre su consulta.
 */
export function visiblesPara<E extends Entrada>(entradas: readonly E[], rol: unknown): E[] {
  return entradas.filter((entrada) => puede(rol, entrada.capacidad));
}

export type Leida<E, T> = { entrada: E; valor: T } | { entrada: E; fallo: true };

/**
 * Lee todas las entradas a la vez y **aisladas**: la que tira queda como
 * fallo, con el error en el log, y las demás siguen. Es el principio del
 * corredor de tareas (`lib/tareas/corredor.ts`): un módulo con un problema no
 * tumba el Inicio, y el bloque dice qué no se pudo leer en vez de callarlo.
 */
export async function leerAisladas<E extends Entrada, T>(entradas: readonly E[], leer: (entrada: E) => Promise<T>): Promise<Array<Leida<E, T>>> {
  return Promise.all(
    entradas.map(async (entrada): Promise<Leida<E, T>> => {
      try {
        return { entrada, valor: await leer(entrada) };
      } catch (e) {
        console.error(`Inicio: no se pudo leer «${entrada.clave}»:`, e instanceof Error ? e.message : e);
        return { entrada, fallo: true };
      }
    }),
  );
}
