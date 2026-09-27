import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaBorrador } from "@/features/quienes-somos/contenido/persona";
import { comoDocumento } from "@/lib/contenido/documento";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { publicacionQueNoFirma } from "./chequeos-del-perfil";
import { nombreDe, problemasDePersona, slugOcupado, slugRepetido } from "./equipo-en-base";
import { LISTAS, tomarLaLista } from "./lista-ordenada";

// Crear, guardar, descartar y borrar un perfil del Equipo en la base (SPEC
// §6.1 de `work/equipo/`), con el cliente inyectado para probarlo contra el
// Postgres local; publicar vive en publicar-equipo.ts y mover, en
// mover-equipo.ts. El borrador se valida con `esquemaBorrador`: puede estar a
// medias, pero no mal. Cada escritura trae el `borradorEn` que vio la
// pantalla (el aviso de choque).

export type ResultadoDeGuardar = { ok: true; id: string; borradorEn: string; borradorPor: string } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese perfil ya no existe: lo borraron desde que lo abriste." };
const EL_PERFIL = "el perfil";

/** El primer guardado de `/admin/contenido/equipo/nuevo`: la fila nace con su borrador, al final del orden. */
export async function crearPersonaEnBase(base: PrismaClient, { contenido, quien }: { contenido: unknown; quien: string }): Promise<ResultadoDeGuardar> {
  const valido = esquemaBorrador.safeParse(contenido);
  if (!valido.success) return problemasDePersona(valido.error);
  const otra = valido.data.slug ? await slugOcupado(base, valido.data.slug, null) : null;
  if (otra) return slugRepetido(otra);
  const sinFirmar = await publicacionQueNoFirma(base, null, valido.data);
  if (sinFirmar) return sinFirmar;
  const ultima = await base.persona.aggregate({ _max: { orden: true } });
  const ahora = new Date();
  // El `as`: el borrador salió de Zod, así que es JSON válido.
  const fila = await base.persona.create({
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien, creadoPor: quien, orden: (ultima._max.orden ?? -1) + 1 },
  });
  return { ok: true, id: fila.id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function guardarPersonaEnBase(
  base: PrismaClient,
  { id, contenido, borradorEnVisto, quien }: { id: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDeGuardar> {
  const valido = esquemaBorrador.safeParse(contenido);
  if (!valido.success) return problemasDePersona(valido.error);
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_PERFIL);
  const otra = valido.data.slug ? await slugOcupado(base, valido.data.slug, id) : null;
  if (otra) return slugRepetido(otra);
  const sinFirmar = await publicacionQueNoFirma(base, id, valido.data);
  if (sinFirmar) return sinFirmar;
  const ahora = new Date();
  // La condición sobre `borradorEn` va a la base: cero filas es que otra persona guardó antes.
  const { count } = await base.persona.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.persona.findUnique({ where: { id } }), EL_PERFIL);
  return { ok: true, id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

/** Vuelve a lo publicado. Un perfil que nunca se publicó no tiene a qué volver. */
export async function descartarCambiosEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; descarto: boolean; nombre: string } | Fallo> {
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_PERFIL);
  if (!fila.publicadoEn) return { ok: false, detalle: "Este perfil nunca se publicó: no hay a qué volver. Si no lo querés, borralo." };
  if (!fila.borrador) return { ok: true, detalle: "No había cambios que descartar.", descarto: false, nombre: nombreDe(fila) };
  const { count } = await base.persona.updateMany({ where: { id, borradorEn: fila.borradorEn }, data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null } });
  if (count === 0) return choqueCon(await base.persona.findUnique({ where: { id } }), EL_PERFIL);
  return { ok: true, detalle: "Se descartaron los cambios: el perfil vuelve a lo publicado.", descarto: true, nombre: nombreDe(fila) };
}

/** El borrador de un material sin la persona en sus autorías: queda de afuera, con su nombre. `null` si no la tenía. */
function sinLaPersona(borrador: Prisma.JsonValue, id: string): Prisma.InputJsonObject | null {
  const documento = comoDocumento(borrador);
  const autorias = Array.isArray(documento.autorias) ? documento.autorias : [];
  if (!autorias.some((a) => comoDocumento(a).persona === id)) return null;
  // El `as`: el borrador guardado salió de Zod, y solo cambia una persona por `null`.
  return { ...documento, autorias: autorias.map((a) => (comoDocumento(a).persona === id ? { ...comoDocumento(a), persona: null } : a)) } as Prisma.InputJsonObject;
}

/**
 * Saca a la persona de los borradores de materiales que la nombran: quedan de
 * afuera, con su nombre. Esas filas quedan bloqueadas (`FOR UPDATE`) hasta el
 * final de la transacción: un guardado que llegue en el medio espera, y no se
 * pisa.
 */
async function sacarDeLosBorradores(tx: Prisma.TransactionClient, id: string) {
  const conBorrador = await tx.$queryRaw<Array<{ id: string; borrador: Prisma.JsonValue }>>`
    SELECT id, borrador FROM materiales
    WHERE borrador @> jsonb_build_object('autorias', jsonb_build_array(jsonb_build_object('persona', ${id}::text)))
    ORDER BY id FOR UPDATE`;
  await Promise.all(
    conBorrador.flatMap((m) => {
      const limpio = sinLaPersona(m.borrador, id);
      return limpio ? [tx.material.update({ where: { id: m.id }, data: { borrador: limpio } })] : [];
    }),
  );
}

/** Otra persona guardó el perfil entre la lectura y el borrado: se deshace todo y se contesta el choque. */
class OtraLlegoAntes extends Error {}

/**
 * Borra la fila y las redirecciones que llevaban a ella. Sus autorías quedan
 * de afuera, con su nombre: en las publicadas lo hace la fk (`SET NULL`), y en
 * los borradores de los materiales, esto (SPEC §6.1, propuesta O). Toma el
 * candado del Equipo, como mover y publicar (lista-ordenada.ts).
 */
export async function borrarPersonaEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; nombre: string; estabaPublicada: boolean } | Fallo> {
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  // Borrar lo que otra persona guardó sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_PERFIL);
  try {
    await base.$transaction(async (tx) => {
      await tomarLaLista(tx, LISTAS.equipo);
      // Los borradores antes que la fila, que suelta sus autorías: es el orden en que publica un material (primero
      // su fila, después sus autorías), así los dos no se esperan en cruz.
      await sacarDeLosBorradores(tx, id);
      const { count } = await tx.persona.deleteMany({ where: { id, borradorEn: fila.borradorEn } });
      if (count === 0) throw new OtraLlegoAntes();
      if (fila.slug) await tx.redireccion.deleteMany({ where: { hacia: `/quienes-somos/equipo/${fila.slug}` } });
    });
  } catch (e) {
    if (e instanceof OtraLlegoAntes) return choqueCon(await base.persona.findUnique({ where: { id } }), EL_PERFIL);
    throw e;
  }
  return { ok: true, nombre: nombreDe(fila), estabaPublicada: fila.publicado };
}
