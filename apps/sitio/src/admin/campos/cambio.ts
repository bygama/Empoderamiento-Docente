// El tipo de "alCambiar" en el árbol de campos del editor: un valor nuevo, o
// una función que arma el valor nuevo a partir del más reciente. La segunda
// forma hace falta cuando algo asíncrono (una foto que sube) resuelve tarde:
// sin ella, el control arma el valor nuevo contra un snapshot viejo y pisa
// lo que se haya tocado en otro campo mientras tanto.
export type Cambio<T> = T | ((actual: T) => T);

/** Resuelve un Cambio<T> contra el valor más reciente: aplica la función, o usa el valor tal cual. */
export function resolverCambio<T>(cambio: Cambio<T>, actual: T): T {
  // Ningún valor que maneja este árbol (texto, foto, lista, grupo) es a su
  // vez una función, así que `typeof` alcanza para distinguir las dos ramas.
  return typeof cambio === "function" ? (cambio as (actual: T) => T)(actual) : cambio;
}
