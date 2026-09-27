import { materialesConElLinkRoto } from "@/datos/consultas/materiales-del-admin";

// Lo que el Inicio lee de la Biblioteca (SPEC §9.3 de `work/biblioteca/`): los
// materiales publicados cuyo último chequeo dio el link roto.

const enLista = new Intl.ListFormat("es", { type: "conjunction" });

/** «2 materiales con el link roto» · «A» y «B», o `null` si no hay ninguno. Pura: se prueba sin base. */
export function filaDeLinksRotos(titulos: readonly string[]): { titulo: string; detalle: string } | null {
  if (!titulos.length) return null;
  const cuantos = titulos.length === 1 ? "1 material" : `${titulos.length} materiales`;
  return { titulo: `${cuantos} con el link roto`, detalle: enLista.format(titulos.map((t) => `«${t}»`)) };
}

export async function materialesConLinksRotos(): Promise<{ titulo: string; detalle: string } | null> {
  return filaDeLinksRotos(await materialesConElLinkRoto());
}
