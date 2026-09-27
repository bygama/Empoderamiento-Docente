import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { publicadoDe } from "@/datos/consultas/materiales";
import { esquemaMaterial } from "@/features/biblioteca/contenido/material";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { falloPorIndice } from "./indices-de-materiales";
import { autoriasDe, borradorSinLugar, columnasDe, problemasDeMaterial, tituloDe } from "./materiales-en-base";
import { novedadesQueLoAbren, soltarElLugar } from "./vecinos-de-materiales";

// Publicar y ocultar un material (SPEC §7 de `work/biblioteca/`), con el
// cliente inyectado como editar-materiales.ts. Publicar copia el borrador a
// las columnas y a las autorías en una transacción que también suelta el
// lugar de destacado si otro lo tenía, y borra el chequeo si cambió el link.

export type ResultadoDePublicar = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; titulo: string; novedades: string[] } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese material ya no existe: lo borraron desde que lo abriste." };
/** Otra persona escribió entre la lectura y la transacción: se deshace todo y se contesta el choque. */
class OtraLlegoAntes extends Error {}

export async function publicarMaterialEnBase(base: PrismaClient, { id, borradorEnVisto, quien }: { id: string; borradorEnVisto: string | null; quien: string }): Promise<ResultadoDePublicar> {
  const fila = await base.material.findUnique({ where: { id }, include: { autorias: true } });
  if (!fila) return NO_EXISTE;
  // Publicar el borrador de otra persona sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el material");
  if (fila.publicado && !fila.borrador) return { ok: false, detalle: "El material ya está publicado así." };
  // Se valida entero al publicar: el borrador pudo guardarse a medias.
  const valido = esquemaMaterial.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!valido.success) return problemasDeMaterial(valido.error);
  const m = valido.data;
  // Un link nuevo se chequea en la próxima corrida: el resultado del viejo ya no dice nada.
  const otroLink = fila.url !== m.url || (fila.doi ?? "") !== m.doi;
  const ahora = new Date();
  try {
    const exDestacado = await base.$transaction(async (tx) => {
      const ex = m.destacado === null ? null : await soltarElLugar(tx, id, m.destacado);
      const { count } = await tx.material.updateMany({
        where: { id, borradorEn: fila.borradorEn },
        data: {
          ...columnasDe(m),
          ...(otroLink ? { chequeoEn: null, chequeo: null, chequeoDetalle: null } : {}),
          publicado: true,
          publicadoEn: ahora,
          publicadoPor: quien,
          borrador: Prisma.DbNull,
          borradorEn: null,
          borradorPor: null,
        },
      });
      if (count === 0) throw new OtraLlegoAntes();
      await tx.autoria.deleteMany({ where: { materialId: id } });
      await tx.autoria.createMany({ data: autoriasDe(id, m) });
      return ex;
    });
    const detalle = exDestacado ? `Publicado: el sitio ya lo muestra, y «${exDestacado}» dejó su lugar entre los destacados.` : "Publicado: el sitio ya lo muestra.";
    return { ok: true, detalle, publicadoEn: ahora.toISOString(), publicadoPor: quien, titulo: m.titulo, novedades: await novedadesQueLoAbren(base, id) };
  } catch (e) {
    if (e instanceof OtraLlegoAntes) return choqueCon(await base.material.findUnique({ where: { id } }), "el material");
    const fallo = await falloPorIndice(base, e, { id, doi: m.doi });
    if (fallo) return fallo;
    throw e;
  }
}

/**
 * Lo saca del sitio y conserva sus columnas: volver a publicarlo es un clic.
 * Si era destacado, deja su lugar, también en su borrador: volver a
 * publicarlo no le roba el lugar al que esté.
 */
export async function ocultarMaterialEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; titulo: string; novedades: string[] } | Fallo> {
  const fila = await base.material.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el material");
  if (!fila.publicado) return { ok: false, detalle: "El material no está en el sitio." };
  const eraDestacado = fila.destacado !== null;
  const { count } = await base.material.updateMany({
    where: { id, publicado: true, borradorEn: fila.borradorEn },
    data: { publicado: false, ...(eraDestacado ? { destacado: null, ...borradorSinLugar(fila.borrador) } : {}) },
  });
  if (count === 0) return choqueCon(await base.material.findUnique({ where: { id } }), "el material");
  const detalle = eraDestacado ? "Oculto: ya no se ve en el sitio, y dejó su lugar entre los destacados." : "Oculto: ya no se ve en el sitio.";
  return { ok: true, detalle, titulo: tituloDe(fila), novedades: await novedadesQueLoAbren(base, id) };
}
