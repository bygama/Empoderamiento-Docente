import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { publicadoDe } from "@/datos/consultas/equipo";
import { esquemaPersona } from "@/features/quienes-somos/contenido/persona";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { CUPO_DEL_SITIO, nivelSinLugar, publicacionQueNoFirma, type Cupo } from "./chequeos-del-perfil";
import { columnasDe, nombreDe, problemasDePersona } from "./equipo-en-base";
import { falloPorIndice } from "./indices-del-equipo";
import { LISTAS, tomarLaLista } from "./lista-ordenada";

// Publicar y despublicar un perfil del Equipo (SPEC §6.1 de `work/equipo/`),
// con el cliente inyectado como editar-equipo.ts. Publicar valida entero,
// chequea que cada publicación de la Biblioteca la firme la persona y que su
// nivel tenga lugar, y copia el borrador a las columnas en una transacción que
// escribe el 308 si cambió la URL. El lugar se cuenta adentro, con el candado
// del Equipo tomado (lista-ordenada.ts): contar sin él deja pasar a dos que
// publican a la vez en la Dirección, y el último lugar del nivel, también.

export type ResultadoDePublicar = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; nombre: string } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese perfil ya no existe: lo borraron desde que lo abriste." };
/** Otra persona escribió entre la lectura y la transacción: se deshace todo y se contesta el choque. */
class OtraLlegoAntes extends Error {}
/** El nivel no tenía lugar, contado con el candado: se deshace todo y se contesta en el campo. */
class SinLugar extends Error {
  constructor(readonly fallo: Fallo) {
    super(fallo.detalle);
  }
}

/** La ficha pública de un perfil: es de la fase 4, pero su 308 ya queda (SPEC §6.3). */
const fichaDe = (slug: string) => `/quienes-somos/equipo/${slug}`;

/** El 308 del slug viejo al nuevo, sin cadenas: lo que llevaba al viejo pasa a llevar al nuevo, y nada sale del nuevo. */
async function redirigir(tx: Prisma.TransactionClient, viejo: string | null, nuevo: string) {
  const hacia = fichaDe(nuevo);
  if (viejo && viejo !== nuevo) {
    const desde = fichaDe(viejo);
    await tx.redireccion.updateMany({ where: { hacia: desde }, data: { hacia } });
    await tx.redireccion.upsert({ where: { desde }, create: { desde, hacia }, update: { hacia } });
  }
  await tx.redireccion.deleteMany({ where: { desde: hacia } });
}

export async function publicarPersonaEnBase(
  base: PrismaClient,
  { id, borradorEnVisto, quien, cupo = CUPO_DEL_SITIO }: { id: string; borradorEnVisto: string | null; quien: string; cupo?: Cupo },
): Promise<ResultadoDePublicar> {
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  // Publicar el borrador de otra persona sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el perfil");
  if (fila.publicado && !fila.borrador) return { ok: false, detalle: "El perfil ya está publicado así." };
  // Se valida entero al publicar: el borrador pudo guardarse a medias.
  const valido = esquemaPersona.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!valido.success) return problemasDePersona(valido.error);
  const p = valido.data;
  const problema = await publicacionQueNoFirma(base, id, p);
  if (problema) return problema;
  const ahora = new Date();
  try {
    await base.$transaction(async (tx) => {
      await tomarLaLista(tx, LISTAS.equipo);
      const sinLugar = await nivelSinLugar(tx, id, p.nivel, cupo);
      if (sinLugar) throw new SinLugar(sinLugar);
      await redirigir(tx, fila.publicadoEn ? fila.slug : null, p.slug);
      // La primera vez, o en otro nivel, queda último en el suyo; si no, conserva su lugar.
      const ultima = fila.publicadoEn && fila.nivel === p.nivel ? null : await tx.persona.aggregate({ where: { nivel: p.nivel, id: { not: id } }, _max: { orden: true } });
      const orden = ultima ? (ultima._max.orden ?? -1) + 1 : fila.orden;
      // La condición sobre `borradorEn` hace que un guardado que se cuele en el medio no se publique sin haberse visto.
      const { count } = await tx.persona.updateMany({
        where: { id, borradorEn: fila.borradorEn },
        data: { ...columnasDe(p), orden, publicado: true, publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
      });
      if (count === 0) throw new OtraLlegoAntes();
    });
    return { ok: true, detalle: "Publicado: el sitio ya lo muestra.", publicadoEn: ahora.toISOString(), publicadoPor: quien, nombre: p.nombre };
  } catch (e) {
    if (e instanceof SinLugar) return e.fallo;
    if (e instanceof OtraLlegoAntes) return choqueCon(await base.persona.findUnique({ where: { id } }), "el perfil");
    const fallo = await falloPorIndice(base, e, { id, slug: p.slug });
    if (fallo) return fallo;
    throw e;
  }
}

/** Lo saca del sitio —la tarjeta y el perfil— y conserva sus columnas: volver a publicarlo es un clic. */
export async function despublicarPersonaEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; nombre: string } | Fallo> {
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el perfil");
  if (!fila.publicado) return { ok: false, detalle: "El perfil no está publicado." };
  const { count } = await base.persona.updateMany({ where: { id, publicado: true, borradorEn: fila.borradorEn }, data: { publicado: false } });
  if (count === 0) return choqueCon(await base.persona.findUnique({ where: { id } }), "el perfil");
  return { ok: true, detalle: "Despublicado: ya no se ve en el sitio.", nombre: nombreDe(fila) };
}
