import { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import type { Fallo } from "./choque";
import { falloEnCampo, tituloDe } from "./novedades-en-base";

// Los dos índices únicos de `novedades` (migración `novedades`) y qué contesta
// publicar cuando salta cada uno. Se distinguen por su nombre: el slug y la
// destacada son campos distintos, y cada uno dice lo que pasó en el suyo.

/** Dónde trae el adaptador de Postgres el nombre del índice que saltó (visto con Prisma 7.10). */
const CAUSA = z.object({ driverAdapterError: z.object({ cause: z.object({ constraint: z.object({ index: z.string() }) }) }) });

/** El nombre del índice único que saltó, o `null` si el error es otro. */
function indiceRepetido(e: unknown): string | null {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return null;
  return CAUSA.safeParse(e.meta).data?.driverAdapterError.cause.constraint.index ?? "";
}

/** La URL que se quiso publicar es de otra: una publicada, o una despublicada que la conserva para volver. */
async function urlDeOtra(base: PrismaClient, id: string, slug: string): Promise<Fallo> {
  const otra = await base.novedad.findFirst({ where: { slug, id: { not: id } }, select: { titulo: true, borrador: true, publicada: true } });
  if (!otra) return falloEnCampo("slug", "Otra novedad tomó esa URL mientras publicabas, y ya la soltó. Publicá de nuevo.");
  if (otra.publicada) return falloEnCampo("slug", `Esa URL ya la usa «${tituloDe(otra)}», que está publicada.`);
  return falloEnCampo("slug", `Esa URL es de «${tituloDe(otra)}», que está despublicada y la conserva para volver al sitio. Elegí otra, o borrá aquella.`);
}

/**
 * Lo que contesta publicar si saltó un índice único, en el campo de ese
 * índice; `null` si el error es otro (y quien llama lo deja subir). La
 * destacada salta solo si otra persona publicó una destacada al mismo tiempo:
 * publicar de nuevo la suelta.
 */
export async function falloPorIndice(base: PrismaClient, e: unknown, { id, slug }: { id: string; slug: string }): Promise<Fallo | null> {
  const indice = indiceRepetido(e);
  if (indice === "novedades_slug_key") return urlDeOtra(base, id, slug);
  if (indice === "novedades_una_sola_destacada") {
    return falloEnCampo("destacada", "Otra novedad pasó a ser la destacada mientras publicabas esta. Publicá de nuevo: al publicar esta, aquella deja de serlo.");
  }
  return null;
}
