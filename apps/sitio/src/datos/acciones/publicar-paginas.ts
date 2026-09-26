import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { comoDocumento, partesDe, propioDe, type PaginaRegistrada, type RegistroDePaginas } from "@/lib/contenido/documento";
import { primerProblema } from "@/lib/contenido/problemas";
import { choqueCon, vioLaFila, type Fallo } from "./choque";

// Publicar en la base (SPEC §7 de la lane del hero): copia el borrador a
// `publicado`, deja `borrador` en null y guarda la versión (SPEC §3 de
// `work/paginas-inicio/`), todo en una transacción. Con el cliente y el
// registro inyectados, como editar-paginas.ts, para probarlo contra el
// Postgres local.

/** Cuántas publicaciones se guardan por página: las más viejas se podan al publicar. */
export const MAXIMO_DE_VERSIONES = 10;

export type ResultadoDePublicar = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; ruta: string } | Fallo;

export async function publicarEnBase(
  base: PrismaClient,
  { slug, quien, borradorEnVisto }: { slug: string; quien: string; borradorEnVisto: string | null },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDePublicar> {
  const pagina: PaginaRegistrada | undefined = propioDe(registro, slug);
  if (!pagina) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const fila = await base.pagina.findUnique({ where: { slug } });
  // Publicar el borrador de otra persona sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila);
  if (!fila?.borrador) return { ok: false, detalle: "No hay cambios sin publicar." };

  // Se valida de nuevo al publicar: el esquema pudo cambiar desde que se
  // guardó el borrador, y lo publicado tiene que pasar siempre.
  const borrador = comoDocumento(fila.borrador);
  const publicado: Record<string, unknown> = {};
  for (const [clave, seccion] of partesDe(pagina)) {
    if (!(clave in borrador)) continue;
    const valido = seccion.esquema.safeParse(borrador[clave]);
    if (!valido.success) return { ok: false, detalle: `No se puede publicar: ${primerProblema(seccion, valido.error)}` };
    publicado[clave] = valido.data;
  }
  const ahora = new Date();
  // Mismo `as` que al guardar: cada valor salió de Zod, así que es JSON válido.
  const documento = publicado as Prisma.InputJsonObject;
  const escrito = await base.$transaction(async (tx) => {
    // La condición sobre `borradorEn` hace que un guardado que se cuele entre
    // la lectura y esta escritura no se publique sin haberse visto.
    const { count } = await tx.pagina.updateMany({
      where: { slug, borradorEn: fila.borradorEn },
      data: { publicado: documento, publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
    });
    if (count === 0) return false;
    await tx.versionDePagina.create({ data: { slug, documento, publicadoEn: ahora, publicadoPor: quien } });
    const viejas = await tx.versionDePagina.findMany({
      where: { slug },
      orderBy: [{ publicadoEn: "desc" }, { id: "desc" }],
      skip: MAXIMO_DE_VERSIONES,
      select: { id: true },
    });
    if (viejas.length > 0) await tx.versionDePagina.deleteMany({ where: { id: { in: viejas.map((v) => v.id) } } });
    return true;
  });
  if (!escrito) return choqueCon(await base.pagina.findUnique({ where: { slug } }));
  return { ok: true, detalle: "Publicado: el sitio ya muestra esta versión.", publicadoEn: ahora.toISOString(), publicadoPor: quien, ruta: pagina.ruta };
}
