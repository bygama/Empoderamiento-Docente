import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaBorrador } from "@/features/biblioteca/contenido/material";
import { validarAlGuardar } from "./al-guardar";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { doiOcupado, doiRepetido, personaQueNoEsta, problemasDeMaterial, sinForma, tituloDe } from "./materiales-en-base";

// Crear, guardar, descartar y borrar un material en la base (SPEC §7 de
// `work/biblioteca/`), con el cliente inyectado para probarlo contra el
// Postgres local; publicar y ocultar viven en publicar-materiales.ts. Las
// Server Actions de materiales.ts verifican la sesión y llaman acá. El
// borrador se valida con `esquemaBorrador`: puede estar a medias, pero no mal.
// Cada escritura trae el `borradorEn` que vio la pantalla (el aviso de choque).

export type ResultadoDeGuardar = { ok: true; id: string; borradorEn: string; borradorPor: string; titulo: string } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese material ya no existe: lo borraron desde que lo abriste." };
const EL_MATERIAL = "el material";

/** El primer guardado de `/admin/biblioteca/nuevo`: la fila nace con su borrador. Un DOI que ya está no entra. */
export async function crearMaterialEnBase(base: PrismaClient, { contenido, quien }: { contenido: unknown; quien: string }): Promise<ResultadoDeGuardar> {
  const valido = validarAlGuardar(() => esquemaBorrador.safeParse(contenido, sinForma));
  if (!valido.success) return problemasDeMaterial(valido.error, "crearMaterial");
  const otro = valido.data.doi ? await doiOcupado(base, valido.data.doi, null) : null;
  if (otro) return doiRepetido(otro);
  const sinPersona = await personaQueNoEsta(base, valido.data.autorias);
  if (sinPersona) return sinPersona;
  const ahora = new Date();
  // El `as`: el borrador salió de Zod, así que es JSON válido.
  const fila = await base.material.create({ data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien, creadoPor: quien } });
  return { ok: true, id: fila.id, borradorEn: ahora.toISOString(), borradorPor: quien, titulo: valido.data.titulo || "Sin título" };
}

export async function guardarMaterialEnBase(
  base: PrismaClient,
  { id, contenido, borradorEnVisto, quien }: { id: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDeGuardar> {
  const valido = validarAlGuardar(() => esquemaBorrador.safeParse(contenido, sinForma));
  if (!valido.success) return problemasDeMaterial(valido.error, "guardarMaterial");
  const fila = await base.material.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_MATERIAL);
  const otro = valido.data.doi ? await doiOcupado(base, valido.data.doi, id) : null;
  if (otro) return doiRepetido(otro);
  const sinPersona = await personaQueNoEsta(base, valido.data.autorias);
  if (sinPersona) return sinPersona;
  const ahora = new Date();
  // La condición sobre `borradorEn` va a la base: cero filas es que otra persona guardó antes.
  const { count } = await base.material.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.material.findUnique({ where: { id } }), EL_MATERIAL);
  return { ok: true, id, borradorEn: ahora.toISOString(), borradorPor: quien, titulo: valido.data.titulo || tituloDe(fila) };
}

/** Vuelve a lo publicado. Un material que nunca se publicó no tiene a qué volver. */
export async function descartarCambiosEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; descarto: boolean; titulo: string } | Fallo> {
  const fila = await base.material.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_MATERIAL);
  if (!fila.publicadoEn) return { ok: false, detalle: "Este material nunca se publicó: no hay a qué volver. Si no lo querés, borralo." };
  if (!fila.borrador) return { ok: true, detalle: "No había cambios que descartar.", descarto: false, titulo: tituloDe(fila) };
  const { count } = await base.material.updateMany({ where: { id, borradorEn: fila.borradorEn }, data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null } });
  if (count === 0) return choqueCon(await base.material.findUnique({ where: { id } }), EL_MATERIAL);
  return { ok: true, detalle: "Se descartaron los cambios: el material vuelve a lo publicado.", descarto: true, titulo: tituloDe(fila) };
}

/**
 * Borra la fila y sus autorías. Las novedades que lo abrían quedan sin botón
 * (la fk es `SET NULL`): dice cuáles, para regenerar sus fichas.
 */
export async function borrarMaterialEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; titulo: string; estabaPublicado: boolean; novedades: string[] } | Fallo> {
  // Las novedades que lo abren se leen con la fila: después de borrar, la fk ya las soltó.
  const fila = await base.material.findUnique({ where: { id }, include: { novedades: { where: { slug: { not: null } }, select: { slug: true } } } });
  if (!fila) return NO_EXISTE;
  // Borrar lo que otra persona guardó sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, EL_MATERIAL);
  const { count } = await base.material.deleteMany({ where: { id, borradorEn: fila.borradorEn } });
  if (count === 0) return choqueCon(await base.material.findUnique({ where: { id } }), EL_MATERIAL);
  return { ok: true, titulo: tituloDe(fila), estabaPublicado: fila.publicado, novedades: fila.novedades.flatMap((n) => (n.slug ? [n.slug] : [])) };
}
