import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { comoDocumento, parteDe, primerProblema, propioDe, type PaginaRegistrada, type RegistroDePaginas, type SeccionRegistrada } from "@/lib/contenido/documento";
import { choqueCon, vioLaFila, type Fallo } from "./choque";

// Guardar y descartar el borrador en la base (SPEC §7 de la lane del hero),
// con el cliente y el registro inyectados para probarlo contra el Postgres
// local; publicar vive en publicar-paginas.ts. Las Server Actions de
// paginas.ts verifican la sesión y llaman acá. Descartar deja `borrador` en
// null: «no hay borrador» quiere decir «el borrador es lo publicado».

export type ResultadoDeGuardar = { ok: true; borradorEn: string; borradorPor: string } | Fallo;

export async function guardarBorradorEnBase(
  base: PrismaClient,
  { slug, seccion, contenido, borradorEnVisto, quien }: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDeGuardar> {
  const pagina: PaginaRegistrada | undefined = propioDe(registro, slug);
  // Una parte: una sección o el SEO (`seo`), con su esquema.
  const definicion: SeccionRegistrada | undefined = pagina && parteDe(pagina, seccion);
  if (!definicion) return { ok: false, detalle: "Esa página o esa sección no se editan desde acá." };
  const valido = definicion.esquema.safeParse(contenido);
  if (!valido.success) return { ok: false, detalle: primerProblema(valido.error) };

  const fila = await base.pagina.findUnique({ where: { slug } });
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila);

  // El borrador arranca como copia de lo publicado: así las otras secciones
  // viajan con él y publicar no las pierde. El `as` vale porque el documento
  // es JSON válido: salió de Zod o de la misma columna.
  const documento = { ...comoDocumento(fila?.borrador ?? fila?.publicado), [seccion]: valido.data } as Prisma.InputJsonObject;
  const ahora = new Date();
  const datos = { borrador: documento, borradorEn: ahora, borradorPor: quien };
  // Las dos escrituras llevan su condición a la base, no al cliente: el alta
  // es un INSERT … ON CONFLICT DO NOTHING (dos pantallas que crean la fila a
  // la vez: la segunda no inserta nada) y el cambio exige el `borradorEn` que
  // se leyó. En los dos casos, cero filas es que otra persona llegó antes.
  const { count } = fila
    ? await base.pagina.updateMany({ where: { slug, borradorEn: fila.borradorEn }, data: datos })
    : await base.pagina.createMany({ data: [{ slug, ...datos }], skipDuplicates: true });
  if (count === 0) return choqueCon(await base.pagina.findUnique({ where: { slug } }));
  return { ok: true, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function descartarBorradorEnBase(
  base: PrismaClient,
  { slug, borradorEnVisto }: { slug: string; borradorEnVisto: string | null },
  registro: RegistroDePaginas = PAGINAS,
): Promise<{ ok: true; detalle: string } | Fallo> {
  if (!propioDe(registro, slug)) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const fila = await base.pagina.findUnique({ where: { slug } });
  if (!fila) return { ok: false, detalle: "Esa página todavía no tiene nada guardado." };
  // Descartar un borrador que otra persona guardó sin haberlo visto también es pisar.
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila);
  // M-4: `updateMany` cuenta la fila, no el cambio; sin esto contestaba «se descartó» aunque `borradorEn` ya fuera null.
  if (!fila.borradorEn) return { ok: true, detalle: "No había borrador que descartar." };
  const { count } = await base.pagina.updateMany({
    where: { slug, borradorEn: fila.borradorEn },
    data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  if (count === 0) return choqueCon(await base.pagina.findUnique({ where: { slug } }));
  return { ok: true, detalle: "Se descartó el borrador: la página vuelve a lo publicado." };
}
