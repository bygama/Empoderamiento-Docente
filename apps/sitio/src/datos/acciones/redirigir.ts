import type { Prisma } from "@/../prisma/generado/client";

/**
 * El 308 de una ruta vieja a la nueva cuando cambia un slug al publicar, sin
 * cadenas: lo que llevaba a la vieja pasa a llevar a la nueva, y nada sale de
 * la nueva (spec del admin §5). Va adentro de la transacción que publica.
 * Sin ruta vieja (nunca se publicó), solo se asegura que nada salga de la
 * nueva. Lo usan Novedades y los casos.
 */
export async function redirigir(tx: Prisma.TransactionClient, desde: string | null, hacia: string): Promise<void> {
  if (desde && desde !== hacia) {
    await tx.redireccion.updateMany({ where: { hacia: desde }, data: { hacia } });
    await tx.redireccion.upsert({ where: { desde }, create: { desde, hacia }, update: { hacia } });
  }
  await tx.redireccion.deleteMany({ where: { desde: hacia } });
}
