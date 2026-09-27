/**
 * Los ids con uno movido un lugar, cambiado con el de al lado: `antes` sube,
 * `despues` baja. `null` si está en esa punta y no hay adónde, y `undefined`
 * si no está. Pura: la usan las listas que se ordenan del admin (los aliados
 * en la tira, el Equipo dentro de su nivel) con su tabla, y se prueba sin base.
 */
export function unPasoMovido(ids: readonly string[], id: string, hacia: "antes" | "despues"): string[] | null | undefined {
  const i = ids.indexOf(id);
  if (i < 0) return undefined;
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return null;
  const nuevo = [...ids];
  [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
  return nuevo;
}
