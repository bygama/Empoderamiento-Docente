import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import { unPasoMovido } from "@/lib/orden";

// Mover en una lista ordenada (DESIGN.md §11, «Lista que se ordena»): la tira
// de aliados y el Equipo. Leer el orden y reescribirlo son dos pasos, y dos
// que mueven a la vez los cruzan: cada uno lee el orden de antes y renumera
// las mismas filas en otro orden, y Postgres corta a uno por deadlock, o el
// segundo pisa el paso del primero (revisión r1 de `work/equipo/`). Por eso
// todo lo que cambia el lugar de una fila (mover, borrar, publicar en un nivel
// con lugares contados) toma primero el candado de su lista, en la misma
// transacción, y recién después lee.

/** Las listas ordenadas de la base, cada una con su candado. */
export const LISTAS = { aliados: "lista:aliados", equipo: "lista:equipo" } as const;
export type Lista = (typeof LISTAS)[keyof typeof LISTAS];

/**
 * Toma el candado de la lista hasta que termine la transacción: otra que lo
 * pida espera. Es un candado con nombre (`pg_advisory_xact_lock`), no de
 * filas: alcanza con que todo lo que cambia la lista lo pida primero.
 */
export async function tomarLaLista(tx: Prisma.TransactionClient, lista: Lista): Promise<void> {
  await tx.$queryRaw`SELECT 1 AS ok FROM pg_advisory_xact_lock(hashtextextended(${lista}, 0))`;
}

type Mover = {
  lista: Lista;
  id: string;
  hacia: "antes" | "despues";
  /** Las ids del grupo donde está `id`, en su orden: se lee con el candado ya tomado. */
  ordenDe: (tx: Prisma.TransactionClient) => Promise<string[]>;
  /** Escribe el lugar nuevo de cada id del grupo, en el orden que recibe. */
  renumerar: (tx: Prisma.TransactionClient, ids: readonly string[]) => Promise<void>;
};

/**
 * Un paso de una fila en su lista, en una transacción: el candado, el orden
 * leído con él y el grupo entero renumerado (así un orden repetido de antes no
 * deja dos en el mismo lugar). `true` si se movió, `false` si estaba en esa
 * punta, `undefined` si la fila ya no está.
 */
export async function moverEnLaLista(base: PrismaClient, { lista, id, hacia, ordenDe, renumerar }: Mover): Promise<boolean | undefined> {
  return base.$transaction(async (tx) => {
    await tomarLaLista(tx, lista);
    const nuevo = unPasoMovido(await ordenDe(tx), id, hacia);
    if (!nuevo) return nuevo === null ? false : undefined;
    await renumerar(tx, nuevo);
    return true;
  });
}
