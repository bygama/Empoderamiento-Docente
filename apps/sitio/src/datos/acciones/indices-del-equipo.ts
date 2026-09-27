import { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import type { Fallo } from "./choque";
import { falloEnCampo, nombreDe } from "./equipo-en-base";

// Los dos índices únicos de `equipo` (migración `equipo`) y qué contesta
// publicar cuando salta cada uno, como los de novedades y materiales: la URL
// y la Dirección general son campos distintos, y cada uno dice lo suyo.

/** Dónde trae el adaptador de Postgres el nombre del índice que saltó (visto con Prisma 7.10). */
const CAUSA = z.object({ driverAdapterError: z.object({ cause: z.object({ constraint: z.object({ index: z.string() }) }) }) });

function indiceRepetido(e: unknown): string | null {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return null;
  return CAUSA.safeParse(e.meta).data?.driverAdapterError.cause.constraint.index ?? "";
}

/**
 * Lo que contesta publicar si saltó un índice único, en el campo de ese
 * índice; `null` si el error es otro (y quien llama lo deja subir). La
 * Dirección general salta solo si otra persona publicó a alguien ahí al
 * mismo tiempo: el chequeo previo ya la vio libre.
 */
export async function falloPorIndice(base: PrismaClient, e: unknown, { id, slug }: { id: string; slug: string }): Promise<Fallo | null> {
  const indice = indiceRepetido(e);
  if (indice === "equipo_slug_key") {
    const otra = await base.persona.findFirst({ where: { slug, id: { not: id } }, select: { nombre: true, borrador: true, publicado: true } });
    if (!otra) return falloEnCampo("slug", "Otro perfil tomó esa URL mientras publicabas, y ya la soltó. Publicá de nuevo.");
    return falloEnCampo("slug", otra.publicado ? `Esa URL ya la usa el perfil de ${nombreDe(otra)}.` : `Esa URL es del perfil de ${nombreDe(otra)}, que está despublicado y la conserva para volver. Elegí otra.`);
  }
  if (indice === "equipo_una_sola_direccion_general") {
    return falloEnCampo("nivel", "Otra persona pasó a la Dirección general mientras publicabas este perfil: lleva una sola. Cambiá el nivel.");
  }
  return null;
}
