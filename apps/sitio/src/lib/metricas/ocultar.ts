// Una cifra chica puede señalar a alguien: una visita desde un país, un
// sistema o un sitio raro es casi una persona. Lo que no llega a `minimo` no
// se muestra por su nombre: se junta con los demás en «Otros». Sin ED.

export type Oculto = { cuantos: number; total: number };

/** Los valores que llegan a `minimo`, en su orden, y cuántos quedaron afuera y cuánto suman. */
export function ocultarMenores<T extends { total: number }>(valores: readonly T[], minimo: number): { visibles: T[]; ocultos: Oculto } {
  const visibles = valores.filter((v) => v.total >= minimo);
  const afuera = valores.filter((v) => v.total < minimo);
  return { visibles, ocultos: { cuantos: afuera.length, total: afuera.reduce((suma, v) => suma + v.total, 0) } };
}
