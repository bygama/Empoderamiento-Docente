import { tituloDe } from "@/datos/acciones/materiales-en-base";
import { base } from "@/datos/cliente";

// Lo que el resto del admin lee de la Biblioteca (SPEC §9.3 de
// `work/biblioteca/`): el número de la sidebar y la fila del Inicio (los
// publicados con el link roto) y qué materiales de la actividad siguen
// existiendo, para linkearlos.

/** Solo los publicados: un link roto de uno que no está en el sitio no le hace mal a nadie. */
const CON_EL_LINK_ROTO = { publicado: true, chequeo: "roto" } as const;

/** Cuántos publicados tienen el link roto: el número de Biblioteca en la sidebar. */
export async function cuantosLinksRotos(): Promise<number> {
  return base.material.count({ where: CON_EL_LINK_ROTO });
}

/** Los títulos de los publicados con el link roto, del chequeo más viejo al más nuevo. */
export async function materialesConElLinkRoto(): Promise<string[]> {
  const filas = await base.material.findMany({ where: CON_EL_LINK_ROTO, orderBy: { chequeoEn: "asc" }, select: { titulo: true, borrador: true } });
  return filas.map(tituloDe);
}

/** De esos ids, los que siguen siendo un material (uno borrado no tiene ficha adonde llevar). */
export async function materialesQueExisten(ids: readonly string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const filas = await base.material.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return new Set(filas.map((f) => f.id));
}
