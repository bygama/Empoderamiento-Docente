import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { publicadoDe } from "@/datos/consultas/novedades";
import { esquemaNovedad } from "@/features/novedades/contenido/novedad";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { falloPorIndice } from "./indices-de-novedades";
import { borradorSinTapa, columnasDe, problemasDeNovedad, tituloDe } from "./novedades-en-base";

// Publicar y despublicar una novedad (SPEC §5.3 de `work/novedades-y-kit/`),
// con el cliente inyectado como editar-novedades.ts. Publicar copia el
// borrador a las columnas en una transacción que también suelta la destacada
// anterior y escribe el 308 si cambió el slug.

export type ResultadoDePublicar =
  | { ok: true; detalle: string; publicadaEn: string; publicadaPor: string; titulo: string; slugs: string[] }
  | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Esa novedad ya no existe: la borraron desde que la abriste." };
/** Otra persona escribió entre la lectura y la transacción: se deshace todo y se contesta el choque. */
class OtraLlegoAntes extends Error {}

/** Suelta la destacada de las demás, en la columna y en su borrador (si no, publicar un arreglo de la vieja le devolvería la tapa). Da el título de la que estaba en el sitio. */
async function soltarLaDestacada(tx: Prisma.TransactionClient, id: string): Promise<string | null> {
  const otras = await tx.novedad.findMany({ where: { id: { not: id }, OR: [{ destacada: true }, { borrador: { path: ["destacada"], equals: true } }] } });
  await Promise.all(otras.map((o) => tx.novedad.update({ where: { id: o.id }, data: { destacada: false, ...borradorSinTapa(o.borrador) } })));
  const enElSitio = otras.find((o) => o.destacada && o.publicada);
  return enElSitio ? tituloDe(enElSitio) : null;
}

/** El 308 del slug viejo al nuevo, sin cadenas: lo que llevaba al viejo pasa a llevar al nuevo, y nada sale del nuevo. */
async function redirigir(tx: Prisma.TransactionClient, viejo: string | null, nuevo: string) {
  const hacia = `/novedades/${nuevo}`;
  if (viejo && viejo !== nuevo) {
    const desde = `/novedades/${viejo}`;
    await tx.redireccion.updateMany({ where: { hacia: desde }, data: { hacia } });
    await tx.redireccion.upsert({ where: { desde }, create: { desde, hacia }, update: { hacia } });
  }
  await tx.redireccion.deleteMany({ where: { desde: hacia } });
}

export async function publicarNovedadEnBase(
  base: PrismaClient,
  { id, borradorEnVisto, quien }: { id: string; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDePublicar> {
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  // Publicar el borrador de otra persona sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "la novedad");
  if (fila.publicada && !fila.borrador) return { ok: false, detalle: "La novedad ya está publicada así." };
  // Se valida entero al publicar: el borrador pudo guardarse a medias.
  const valido = esquemaNovedad.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!valido.success) return problemasDeNovedad(valido.error);
  const n = valido.data;
  const ahora = new Date();
  try {
    const exDestacada = await base.$transaction(async (tx) => {
      const ex = n.destacada ? await soltarLaDestacada(tx, id) : null;
      await redirigir(tx, fila.publicadaEn ? fila.slug : null, n.slug);
      // La condición sobre `borradorEn` hace que un guardado que se cuele en el medio no se publique sin haberse visto.
      const { count } = await tx.novedad.updateMany({
        where: { id, borradorEn: fila.borradorEn },
        data: { ...columnasDe(n), publicada: true, publicadaEn: ahora, publicadaPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
      });
      if (count === 0) throw new OtraLlegoAntes();
      return ex;
    });
    const slugs = [n.slug, ...(fila.slug && fila.slug !== n.slug ? [fila.slug] : [])];
    const detalle = exDestacada ? `Publicada: el sitio ya la muestra, y «${exDestacada}» dejó de ser la destacada.` : "Publicada: el sitio ya la muestra.";
    return { ok: true, detalle, publicadaEn: ahora.toISOString(), publicadaPor: quien, titulo: n.titulo, slugs };
  } catch (e) {
    if (e instanceof OtraLlegoAntes) return choqueCon(await base.novedad.findUnique({ where: { id } }), "la novedad");
    const fallo = await falloPorIndice(base, e, { id, slug: n.slug });
    if (fallo) return fallo;
    throw e;
  }
}

/** Saca la novedad del sitio y conserva sus columnas: volver a publicarla es un clic. Si era la destacada, deja de serlo. */
export async function despublicarNovedadEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; titulo: string; slugs: string[] } | Fallo> {
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "la novedad");
  if (!fila.publicada) return { ok: false, detalle: "La novedad no está publicada." };
  const { count } = await base.novedad.updateMany({
    where: { id, publicada: true, borradorEn: fila.borradorEn },
    data: { publicada: false, destacada: false, ...borradorSinTapa(fila.borrador) },
  });
  if (count === 0) return choqueCon(await base.novedad.findUnique({ where: { id } }), "la novedad");
  const detalle = fila.destacada ? "Despublicada: ya no se ve en el sitio, y dejó de ser la destacada." : "Despublicada: ya no se ve en el sitio.";
  return { ok: true, detalle, titulo: tituloDe(fila), slugs: fila.slug ? [fila.slug] : [] };
}
