// Cómo se leen las búsquedas copiadas. Sin dominio de ED: los umbrales son de
// cualquier sitio chico, y están acá con nombre para ajustarlos cuando haya
// datos reales (work/busquedas-de-google/SPEC.md §4.1).

/** Lo que suma una búsqueda, una página o un país en un período. */
export type Agregado = { valor: string; clics: number; impresiones: number; sumaDePosiciones: number };

/** La posición promedio de un agregado, bien ponderada: cada impresión pesa lo mismo. */
export function posicionPromedio(sumaDePosiciones: number, impresiones: number): number | null {
  return impresiones > 0 ? sumaDePosiciones / impresiones : null;
}

/** Por clics y, a igual clics, por impresiones: lo que más trae gente, arriba. */
export function ordenarPorClics<T extends Agregado>(filas: readonly T[]): T[] {
  return [...filas].sort((a, b) => b.clics - a.clics || b.impresiones - a.impresiones);
}

/** Entre estos puestos: al pie de la primera página o en la segunda. */
export const PUESTOS_CASI = { desde: 8, hasta: 20 } as const;
/** Con menos impresiones, una posición o un porcentaje de clics es ruido. */
export const MINIMO_DE_IMPRESIONES = 10;
/** «Muchas impresiones y pocos clics»: 50 o más, y menos del 2 % de clics. */
export const MUCHAS_IMPRESIONES = 50;
export const POCOS_CLICS = 0.02;
export const MAXIMO_CASI = 10;

export type Casi = Agregado & {
  posicion: number;
  /** Por qué entró: el puesto, o que se ve mucho y se toca poco. Si cumple las dos, el puesto. */
  razon: "puesto" | "pocos-clics";
};

/** «Casi nos encuentran»: las búsquedas donde un empujón cambia algo, las más vistas primero. */
export function casiNosEncuentran(filas: readonly Agregado[]): Casi[] {
  return filas
    .flatMap((fila): Casi[] => {
      if (fila.impresiones < MINIMO_DE_IMPRESIONES) return [];
      const posicion = fila.sumaDePosiciones / fila.impresiones;
      if (posicion >= PUESTOS_CASI.desde && posicion <= PUESTOS_CASI.hasta) return [{ ...fila, posicion, razon: "puesto" }];
      if (fila.impresiones >= MUCHAS_IMPRESIONES && fila.clics / fila.impresiones < POCOS_CLICS) return [{ ...fila, posicion, razon: "pocos-clics" }];
      return [];
    })
    .sort((a, b) => b.impresiones - a.impresiones)
    .slice(0, MAXIMO_CASI);
}
