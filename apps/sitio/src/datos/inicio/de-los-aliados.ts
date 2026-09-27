import { listaDeAliados } from "@/datos/consultas/aliados-del-admin";

// Lo que el Inicio lee de la tabla `aliados` (SPEC de `work/casos-aliados-fotos/`
// §9): los que no tienen la marca «Autorizado», que sin ella no se publican.

const enLista = new Intl.ListFormat("es", { type: "conjunction" });

/** «2 aliados sin autorizar» · «UNESCO y OEI», o `null` si no hay ninguno. Pura: se prueba sin base. */
export function filaDeAliadosSinAutorizar(nombres: readonly string[]): { titulo: string; detalle: string } | null {
  if (!nombres.length) return null;
  const cuantos = nombres.length === 1 ? "1 aliado" : `${nombres.length} aliados`;
  return { titulo: `${cuantos} sin autorizar`, detalle: enLista.format(nombres) };
}

/** Los sin autorizar en el orden de la tira, con el nombre que se está escribiendo si todavía no se publicaron. */
export async function aliadosSinAutorizar(): Promise<{ titulo: string; detalle: string } | null> {
  const filas = await listaDeAliados();
  return filaDeAliadosSinAutorizar(filas.filter((f) => !f.autorizado).map((f) => f.nombre || "uno sin nombre todavía"));
}
