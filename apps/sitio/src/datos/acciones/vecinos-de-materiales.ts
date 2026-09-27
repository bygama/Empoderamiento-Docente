import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import { comoDocumento } from "@/lib/contenido/documento";
import { borradorSinLugar, tituloDe } from "./materiales-en-base";

// Lo que publicar, ocultar o borrar un material toca afuera de su fila: el
// lugar de destacado de otro material y las novedades que lo abren.

/** Los slugs de las novedades que abren este material: sus fichas muestran su botón y se regeneran. */
export async function novedadesQueLoAbren(base: PrismaClient, id: string): Promise<string[]> {
  const filas = await base.novedad.findMany({ where: { materialId: id, slug: { not: null } }, select: { slug: true } });
  return filas.flatMap((n) => (n.slug ? [n.slug] : []));
}

/**
 * Suelta ese lugar de los destacados de los demás materiales, en la columna y
 * en su borrador (si no, publicar un arreglo del otro le devolvería el lugar).
 * Da el título del que estaba en el sitio en ese lugar, para avisarlo.
 */
export async function soltarElLugar(tx: Prisma.TransactionClient, id: string, lugar: number): Promise<string | null> {
  const otros = await tx.material.findMany({ where: { id: { not: id }, OR: [{ destacado: lugar }, { borrador: { path: ["destacado"], equals: lugar } }] } });
  await Promise.all(
    otros.map((o) => {
      const columna = o.destacado === lugar ? { destacado: null } : {};
      // El borrador solo si pedía este lugar: si pedía otro, esa intención sigue.
      const borrador = comoDocumento(o.borrador).destacado === lugar ? borradorSinLugar(o.borrador) : {};
      return tx.material.update({ where: { id: o.id }, data: { ...columna, ...borrador } });
    }),
  );
  const enElSitio = otros.find((o) => o.destacado === lugar && o.publicado);
  return enElSitio ? tituloDe(enElSitio) : null;
}
