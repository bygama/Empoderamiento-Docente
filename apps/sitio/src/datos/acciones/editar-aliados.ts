import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaBorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { validarAlGuardar } from "./al-guardar";
import { NO_EXISTE, nombreDelAliado, problemasDeAliado } from "./aliados-en-base";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { LISTAS, tomarLaLista } from "./lista-ordenada";

// Crear, guardar, descartar y borrar un aliado en la base
// (`work/casos-aliados-fotos/SPEC.md` §6), con el cliente inyectado para
// probarlo contra el Postgres local; publicar está en publicar-aliados.ts y
// la marca y el orden, en autorizar-aliados.ts. El borrador se valida con
// `esquemaBorradorDeAliado`: puede estar a medias, pero no mal. Cada
// escritura trae el `borradorEn` que vio la pantalla (el aviso de choque).

export type ResultadoDeGuardarAliado = { ok: true; id: string; borradorEn: string; borradorPor: string } | Fallo;

/** El primer guardado de `/nuevo`: la fila nace con su borrador, al final de la tira y sin autorizar. */
export async function crearAliadoEnBase(base: PrismaClient, { contenido, quien }: { contenido: unknown; quien: string }): Promise<ResultadoDeGuardarAliado> {
  const valido = validarAlGuardar(() => esquemaBorradorDeAliado.safeParse(contenido));
  if (!valido.success) return problemasDeAliado(valido.error);
  const ultimo = await base.aliado.aggregate({ _max: { orden: true } });
  const ahora = new Date();
  // El `as`: el borrador salió de Zod, así que es JSON válido.
  const fila = await base.aliado.create({
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien, creadoPor: quien, orden: (ultimo._max.orden ?? 0) + 1 },
  });
  return { ok: true, id: fila.id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function guardarAliadoEnBase(
  base: PrismaClient,
  { id, contenido, borradorEnVisto, quien }: { id: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDeGuardarAliado> {
  const valido = validarAlGuardar(() => esquemaBorradorDeAliado.safeParse(contenido));
  if (!valido.success) return problemasDeAliado(valido.error);
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el aliado");
  const ahora = new Date();
  // La condición sobre `borradorEn` va a la base: cero filas es que otra persona guardó antes.
  const { count } = await base.aliado.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.aliado.findUnique({ where: { id } }), "el aliado");
  return { ok: true, id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

/** Vuelve a lo publicado. Uno que nunca se publicó no tiene a qué volver. */
export async function descartarCambiosDeAliadoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; descarto: boolean } | Fallo> {
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el aliado");
  if (!fila.publicadoEn) return { ok: false, detalle: "Este aliado nunca se publicó: no hay a qué volver. Si no lo querés, borralo." };
  if (!fila.borrador) return { ok: true, detalle: "No había cambios que descartar.", descarto: false };
  const { count } = await base.aliado.updateMany({ where: { id, borradorEn: fila.borradorEn }, data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null } });
  if (count === 0) return choqueCon(await base.aliado.findUnique({ where: { id } }), "el aliado");
  return { ok: true, detalle: "Se descartaron los cambios: el aliado vuelve a lo publicado.", descarto: true };
}

/** Borra la fila: si estaba en la tira, deja de verse. El logo queda en Fotos. Con el candado de la tira, como mover. */
export async function borrarAliadoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; nombre: string; estabaEnElSitio: boolean } | Fallo> {
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  // Borrar lo que otra persona guardó sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el aliado");
  const { count } = await base.$transaction(async (tx) => {
    await tomarLaLista(tx, LISTAS.aliados);
    return tx.aliado.deleteMany({ where: { id, borradorEn: fila.borradorEn } });
  });
  if (count === 0) return choqueCon(await base.aliado.findUnique({ where: { id } }), "el aliado");
  return { ok: true, nombre: nombreDelAliado(fila), estabaEnElSitio: fila.publicado && fila.autorizado };
}
