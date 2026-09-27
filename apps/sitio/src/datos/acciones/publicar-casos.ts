import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaCaso } from "@/features/investigacion/contenido/caso";
import { nombreDelCaso, type IdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import { columnasDeCaso, falloEnCampoDelCaso, problemasDeCaso, rutaDelCaso } from "./casos-en-base";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { redirigir } from "./redirigir";

// Publicar un caso (`work/casos-aliados-fotos/SPEC.md` §4.1 y §6), con el
// cliente inyectado como editar-casos.ts: valida el borrador entero, lo copia
// a las columnas y, si cambió el slug, escribe en la misma transacción el 308
// de su ficha vieja a la nueva (la ficha es de la fase 4; el 308 ya queda).

export type ResultadoDePublicarCaso = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; nombre: string } | Fallo;

/** Otra persona escribió entre la lectura y la transacción: se deshace todo y se contesta el choque. */
class OtraLlegoAntes extends Error {}

/** ¿El error es el índice único del slug? Otro caso tomó esa URL mientras tanto. */
const esSlugRepetido = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function publicarCasoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto, quien }: { id: IdDeCaso; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDePublicarCaso> {
  const fila = await base.caso.findUnique({ where: { id } });
  if (!fila) return { ok: false, detalle: "Ese caso no existe." };
  // Publicar el borrador de otra persona sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el caso");
  if (!fila.borrador) return { ok: false, detalle: "El caso ya está publicado así." };
  // Se valida entero al publicar: el borrador pudo guardarse a medias.
  const valido = esquemaCaso.safeParse(fila.borrador);
  if (!valido.success) return problemasDeCaso(valido.error);
  const c = valido.data;
  const ahora = new Date();
  try {
    await base.$transaction(async (tx) => {
      await redirigir(tx, rutaDelCaso(fila.slug), rutaDelCaso(c.slug));
      // La condición sobre `borradorEn` hace que un guardado que se cuele en el medio no se publique sin haberse visto.
      const { count } = await tx.caso.updateMany({
        where: { id, borradorEn: fila.borradorEn },
        data: { ...columnasDeCaso(c), publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
      });
      if (count === 0) throw new OtraLlegoAntes();
    });
  } catch (e) {
    if (e instanceof OtraLlegoAntes) return choqueCon(await base.caso.findUnique({ where: { id } }), "el caso");
    if (esSlugRepetido(e)) return falloEnCampoDelCaso("slug", "Otro caso tomó esa URL mientras publicabas. Elegí otra.");
    throw e;
  }
  const detalle = fila.slug === c.slug ? "Publicado: el sitio ya lo muestra." : `Publicado: el sitio ya lo muestra, y ${rutaDelCaso(fila.slug)} pasa a llevar a la URL nueva.`;
  return { ok: true, detalle, publicadoEn: ahora.toISOString(), publicadoPor: quien, nombre: nombreDelCaso(id) };
}
