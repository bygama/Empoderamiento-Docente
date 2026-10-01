import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaBorrador } from "@/features/novedades/contenido/novedad";
import { validarAlGuardar } from "./al-guardar";
import { choqueCon, vioLaFila, type Fallo } from "./choque";
import { falloEnCampo, materialQueNoEsta, problemasDeNovedad, slugOcupado, tituloDe } from "./novedades-en-base";

// Crear, guardar, descartar y borrar una novedad en la base (SPEC §5.3 de
// `work/novedades-y-kit/`), con el cliente inyectado para probarlo contra el
// Postgres local; publicar vive en publicar-novedades.ts. Las Server Actions
// de novedades.ts verifican la sesión y llaman acá. El borrador se valida con
// `esquemaBorrador`: puede estar a medias, pero no mal. Cada escritura trae el
// `borradorEn` que vio la pantalla (el aviso de choque de las páginas).

export type ResultadoDeGuardar = { ok: true; id: string; borradorEn: string; borradorPor: string } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Esa novedad ya no existe: la borraron desde que la abriste." };

/** El primer guardado de `/admin/novedades/nueva`: la fila nace con su borrador. */
export async function crearNovedadEnBase(base: PrismaClient, { contenido, quien }: { contenido: unknown; quien: string }): Promise<ResultadoDeGuardar> {
  const valido = validarAlGuardar(() => esquemaBorrador.safeParse(contenido));
  if (!valido.success) return problemasDeNovedad(valido.error);
  const ocupado = valido.data.slug ? await slugOcupado(base, valido.data.slug, null) : null;
  if (ocupado) return falloEnCampo("slug", `Esa URL ya la usa «${ocupado}».`);
  const sinMaterial = await materialQueNoEsta(base, valido.data.material);
  if (sinMaterial) return sinMaterial;
  const ahora = new Date();
  // El `as`: el borrador salió de Zod, así que es JSON válido.
  const fila = await base.novedad.create({ data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien, creadaPor: quien } });
  return { ok: true, id: fila.id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function guardarNovedadEnBase(
  base: PrismaClient,
  { id, contenido, borradorEnVisto, quien }: { id: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDeGuardar> {
  const valido = validarAlGuardar(() => esquemaBorrador.safeParse(contenido));
  if (!valido.success) return problemasDeNovedad(valido.error);
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "la novedad");
  const ocupado = valido.data.slug ? await slugOcupado(base, valido.data.slug, id) : null;
  if (ocupado) return falloEnCampo("slug", `Esa URL ya la usa «${ocupado}».`);
  const sinMaterial = await materialQueNoEsta(base, valido.data.material);
  if (sinMaterial) return sinMaterial;
  const ahora = new Date();
  // La condición sobre `borradorEn` va a la base: cero filas es que otra persona guardó antes.
  const { count } = await base.novedad.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.novedad.findUnique({ where: { id } }), "la novedad");
  return { ok: true, id, borradorEn: ahora.toISOString(), borradorPor: quien };
}

/** Vuelve a lo publicado. Una novedad que nunca se publicó no tiene a qué volver. */
export async function descartarCambiosEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; descarto: boolean; titulo: string } | Fallo> {
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "la novedad");
  if (!fila.publicadaEn) return { ok: false, detalle: "Esta novedad nunca se publicó: no hay a qué volver. Si no la querés, borrala." };
  if (!fila.borrador) return { ok: true, detalle: "No había cambios que descartar.", descarto: false, titulo: tituloDe(fila) };
  const { count } = await base.novedad.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  if (count === 0) return choqueCon(await base.novedad.findUnique({ where: { id } }), "la novedad");
  return { ok: true, detalle: "Se descartaron los cambios: la novedad vuelve a lo publicado.", descarto: true, titulo: tituloDe(fila) };
}

/** Borra la fila y las redirecciones que llevaban a ella: su URL pasa a dar 404. */
export async function borrarNovedadEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; titulo: string; slug: string | null; estabaPublicada: boolean } | Fallo> {
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  // Borrar lo que otra persona guardó sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "la novedad");
  const borrada = await base.$transaction(async (tx) => {
    const { count } = await tx.novedad.deleteMany({ where: { id, borradorEn: fila.borradorEn } });
    if (count === 0) return false;
    if (fila.slug) await tx.redireccion.deleteMany({ where: { hacia: `/novedades/${fila.slug}` } });
    return true;
  });
  if (!borrada) return choqueCon(await base.novedad.findUnique({ where: { id } }), "la novedad");
  return { ok: true, titulo: tituloDe(fila), slug: fila.slug, estabaPublicada: fila.publicada };
}
