import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { comoDocumento, parteDe, propioDe, type PaginaRegistrada, type RegistroDePaginas } from "@/lib/contenido/documento";
import { primerProblema } from "@/lib/contenido/problemas";
import { choqueCon, vioLaFila, type Fallo } from "./choque";

// «Restaurar como borrador» (SPEC §3 de `work/paginas-inicio/`), con el
// cliente y el registro inyectados para probarlo contra el Postgres local.
// Las Server Actions de versiones.ts verifican la sesión y llaman acá.

/** Una parte de la versión que no entró al borrador, y por qué. */
export type NoEntro = { parte: string; motivo: string };

export type ResultadoDeRestaurar = { ok: true; borradorEn: string; borradorPor: string; noEntraron: NoEntro[] } | Fallo;

/**
 * El borrador pasa a ser lo que hay ahora (el borrador o, si no hay, lo
 * publicado) con cada parte de la versión que pase el esquema de hoy encima.
 * Lo que no pasa, y lo que la versión trae de una parte que ya no existe, no
 * entra y se dice; una parte que la versión no tiene queda como está.
 * Restaurar no publica, y trae el `borradorEn` que vio la pantalla: si otra
 * persona guardó mientras tanto, choca.
 */
export async function restaurarVersionEnBase(
  base: PrismaClient,
  { slug, version, borradorEnVisto, quien }: { slug: string; version: string; borradorEnVisto: string | null; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDeRestaurar> {
  const pagina: PaginaRegistrada | undefined = propioDe(registro, slug);
  if (!pagina) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const guardada = await base.versionDePagina.findFirst({ where: { id: version, slug } });
  if (!guardada) return { ok: false, detalle: "Esa versión ya no está: se guardan las últimas 10." };
  const fila = await base.pagina.findUnique({ where: { slug } });
  if (!fila || !vioLaFila(fila, borradorEnVisto)) return choqueCon(fila);

  const documento = comoDocumento(fila.borrador ?? fila.publicado);
  const noEntraron: NoEntro[] = [];
  for (const [clave, valor] of Object.entries(comoDocumento(guardada.documento))) {
    const parte = parteDe(pagina, clave);
    if (!parte) {
      noEntraron.push({ parte: clave, motivo: "esa parte ya no se edita" });
      continue;
    }
    const valido = parte.esquema.safeParse(valor);
    if (valido.success) documento[clave] = valido.data;
    else noEntraron.push({ parte: parte.nombre, motivo: `${primerProblema(parte, valido.error)} Queda como está ahora` });
  }

  const ahora = new Date();
  // El `as`: el documento es JSON válido, salió de la columna o de Zod.
  const { count } = await base.pagina.updateMany({
    where: { slug, borradorEn: fila.borradorEn },
    data: { borrador: documento as Prisma.InputJsonObject, borradorEn: ahora, borradorPor: quien },
  });
  if (count === 0) return choqueCon(await base.pagina.findUnique({ where: { slug } }));
  return { ok: true, borradorEn: ahora.toISOString(), borradorPor: quien, noEntraron };
}
