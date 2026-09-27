/**
 * La tira con ese aliado un lugar más arriba o más abajo, cambiado con el de
 * al lado; `null` si está en esa punta y no hay adónde, y `undefined` si no
 * está. Pura: se prueba sin base (`moverAliadoEnBase` la usa con la tabla).
 */
export function tiraMovida(ids: readonly string[], id: string, hacia: "antes" | "despues"): string[] | null | undefined {
  const i = ids.indexOf(id);
  if (i < 0) return undefined;
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return null;
  const nuevo = [...ids];
  [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
  return nuevo;
}
