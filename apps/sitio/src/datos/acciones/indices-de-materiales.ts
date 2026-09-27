import { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import type { Fallo } from "./choque";
import { falloEnCampo, tituloDe } from "./materiales-en-base";

// Los dos índices únicos de `materiales` (migración `biblioteca`) y qué
// contesta publicar cuando salta cada uno. Se distinguen por su nombre: el DOI
// y el lugar de destacado son campos distintos, y cada uno dice lo suyo.

/** Dónde trae el adaptador de Postgres el nombre del índice que saltó (visto con Prisma 7.10). */
const CAUSA = z.object({ driverAdapterError: z.object({ cause: z.object({ constraint: z.object({ index: z.string() }) }) }) });

function indiceRepetido(e: unknown): string | null {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return null;
  return CAUSA.safeParse(e.meta).data?.driverAdapterError.cause.constraint.index ?? "";
}

/**
 * Lo que contesta publicar si saltó un índice único, en el campo de ese
 * índice; `null` si el error es otro (y quien llama lo deja subir). El lugar
 * salta solo si otra persona publicó otro material en ese lugar al mismo
 * tiempo: publicar de nuevo lo suelta.
 */
export async function falloPorIndice(base: PrismaClient, e: unknown, { id, doi }: { id: string; doi: string }): Promise<Fallo | null> {
  const indice = indiceRepetido(e);
  if (indice === "materiales_doi_key") {
    const otro = await base.material.findFirst({ where: { doi, id: { not: id } }, select: { titulo: true, borrador: true } });
    return falloEnCampo("doi", otro ? `Ese DOI ya lo tiene «${tituloDe(otro)}».` : "Otro material tomó ese DOI mientras publicabas. Publicá de nuevo.");
  }
  if (indice === "materiales_destacado_key") {
    return falloEnCampo("destacado", "Otro material pasó a ese lugar de los destacados mientras publicabas este. Publicá de nuevo: al publicar este, aquel deja el lugar.");
  }
  return null;
}
