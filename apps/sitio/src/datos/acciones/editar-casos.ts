import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { esquemaBorradorDeCaso } from "@/features/investigacion/contenido/caso";
import { nombreDelCaso, type IdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import { falloEnCampoDelCaso, problemasDeCaso, slugDeOtroCaso } from "./casos-en-base";
import { choqueCon, vioLaFila, type Fallo } from "./choque";

// Guardar el borrador de un caso y descartarlo (`work/casos-aliados-fotos/SPEC.md`
// §6), con el cliente inyectado para probarlo contra el Postgres local;
// publicar vive en publicar-casos.ts. Un caso no se crea ni se borra: son
// cuatro. Cada escritura trae el `borradorEn` que vio la pantalla (el aviso
// de choque de las páginas).

export type ResultadoDeGuardarCaso = { ok: true; borradorEn: string; borradorPor: string } | Fallo;

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese caso no existe." };

export async function guardarCasoEnBase(
  base: PrismaClient,
  { id, contenido, borradorEnVisto, quien }: { id: IdDeCaso; contenido: unknown; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDeGuardarCaso> {
  const valido = esquemaBorradorDeCaso.safeParse(contenido);
  if (!valido.success) return problemasDeCaso(valido.error);
  const fila = await base.caso.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el caso");
  const ocupado = valido.data.slug ? await slugDeOtroCaso(base, valido.data.slug, id) : null;
  if (ocupado) return falloEnCampoDelCaso("slug", `Esa URL ya la usa el ${ocupado.toLowerCase()}.`);
  const ahora = new Date();
  // La condición sobre `borradorEn` va a la base: cero filas es que otra persona guardó antes. El `as`: salió de Zod.
  const { count } = await base.caso.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: valido.data as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.caso.findUnique({ where: { id } }), "el caso");
  return { ok: true, borradorEn: ahora.toISOString(), borradorPor: quien };
}

/** Vuelve a lo publicado: un caso siempre tiene a qué volver. */
export async function descartarCambiosDeCasoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: IdDeCaso; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; descarto: boolean; nombre: string } | Fallo> {
  const fila = await base.caso.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el caso");
  if (!fila.borrador) return { ok: true, detalle: "No había cambios que descartar.", descarto: false, nombre: nombreDelCaso(id) };
  const { count } = await base.caso.updateMany({
    where: { id, borradorEn: fila.borradorEn },
    data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  if (count === 0) return choqueCon(await base.caso.findUnique({ where: { id } }), "el caso");
  return { ok: true, detalle: "Se descartaron los cambios: el caso vuelve a lo publicado.", descarto: true, nombre: nombreDelCaso(id) };
}
