import { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { comoDocumento, type PaginaRegistrada, type RegistroDePaginas, type SeccionRegistrada } from "@/lib/contenido/documento";
import { haceCuanto } from "@/lib/contenido/tiempo";

// Lo que hace cada acción del editor en la base (SPEC §7), con el cliente y
// el registro inyectados para probarlo contra el Postgres local. Las Server
// Actions de paginas.ts verifican la sesión y llaman acá. Publicar y
// descartar dejan `borrador` en null: «no hay borrador» quiere decir «el
// borrador es lo publicado» (DECISIONS, 4).

type Fila = { borrador: unknown; publicado: unknown; borradorEn: Date | null; borradorPor: string | null };

export type ResultadoDeGuardar = { ok: true; borradorEn: string; borradorPor: string } | { ok: false; detalle: string };
export type ResultadoDePublicar =
  | { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; ruta: string }
  | { ok: false; detalle: string };

/**
 * El valor de una clave PROPIA del registro, o undefined si no está. Un
 * `registro[clave]` a secas deja pasar `"__proto__"`, `"constructor"` y
 * similares como si fueran una página o sección real (resuelven al
 * prototipo del objeto, que existe pero no tiene `secciones` ni `esquema`,
 * y el código de abajo tira en vez de contestar en llano); `Object.hasOwn`
 * corta eso antes de indexar.
 */
function propioDe<T>(registro: Record<string, T>, clave: string): T | undefined {
  return Object.hasOwn(registro, clave) ? registro[clave] : undefined;
}

/** El primer problema de Zod, en llano y con el camino al campo. */
function primerProblema(error: z.ZodError): string {
  const [problema] = error.issues;
  const donde = problema && problema.path.length > 0 ? ` (en ${problema.path.map(String).join(" › ")})` : "";
  return `${problema?.message ?? "Hay un dato que no pasa."}${donde}`;
}

function mensajeDeConflicto(fila: Fila | null): string {
  if (fila?.borradorEn) {
    return `${fila.borradorPor ?? "Alguien"} guardó este borrador ${haceCuanto(fila.borradorEn)}. Recargá para ver sus cambios antes de guardar los tuyos.`;
  }
  return "Este borrador se publicó o se descartó desde que abriste la página. Recargá para seguir.";
}

export async function guardarBorradorEnBase(
  base: PrismaClient,
  { slug, seccion, contenido, borradorEnVisto, quien }: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDeGuardar> {
  const pagina: PaginaRegistrada | undefined = propioDe(registro, slug);
  const definicion: SeccionRegistrada | undefined = pagina && propioDe(pagina.secciones, seccion);
  if (!definicion) return { ok: false, detalle: "Esa página o esa sección no se editan desde acá." };
  const valido = definicion.esquema.safeParse(contenido);
  if (!valido.success) return { ok: false, detalle: primerProblema(valido.error) };

  const fila = await base.pagina.findUnique({ where: { slug } });
  if ((fila?.borradorEn?.toISOString() ?? null) !== borradorEnVisto) return { ok: false, detalle: mensajeDeConflicto(fila) };

  // El borrador arranca como copia de lo publicado: así las otras secciones
  // viajan con él y publicar no las pierde. El `as` vale porque el documento
  // es JSON válido: salió de Zod o de la misma columna.
  const documento = { ...comoDocumento(fila?.borrador ?? fila?.publicado), [seccion]: valido.data } as Prisma.InputJsonObject;
  const ahora = new Date();
  const datos = { borrador: documento, borradorEn: ahora, borradorPor: quien };
  if (!fila) {
    await base.pagina.create({ data: { slug, ...datos } });
  } else {
    // La condición sobre borradorEn hace que dos guardados a la vez no se
    // pisen: el segundo no encuentra la fila y avisa.
    const { count } = await base.pagina.updateMany({ where: { slug, borradorEn: fila.borradorEn }, data: datos });
    if (count === 0) return { ok: false, detalle: mensajeDeConflicto(await base.pagina.findUnique({ where: { slug } })) };
  }
  return { ok: true, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function publicarEnBase(
  base: PrismaClient,
  { slug, quien }: { slug: string; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDePublicar> {
  const pagina: PaginaRegistrada | undefined = propioDe(registro, slug);
  if (!pagina) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const fila = await base.pagina.findUnique({ where: { slug } });
  if (!fila?.borrador) return { ok: false, detalle: "No hay cambios sin publicar." };

  // Se valida de nuevo al publicar: el esquema pudo cambiar desde que se
  // guardó el borrador, y lo publicado tiene que pasar siempre.
  const borrador = comoDocumento(fila.borrador);
  const publicado: Record<string, unknown> = {};
  for (const [clave, seccion] of Object.entries(pagina.secciones)) {
    if (!(clave in borrador)) continue;
    const valido = seccion.esquema.safeParse(borrador[clave]);
    if (!valido.success) return { ok: false, detalle: `La sección «${seccion.nombre}» no pasa: ${primerProblema(valido.error)}` };
    publicado[clave] = valido.data;
  }
  const ahora = new Date();
  // Mismo `as` que al guardar: cada valor salió de Zod, así que es JSON válido.
  await base.pagina.update({
    where: { slug },
    data: { publicado: publicado as Prisma.InputJsonObject, publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  return { ok: true, detalle: "Publicado: el sitio ya muestra esta versión.", publicadoEn: ahora.toISOString(), publicadoPor: quien, ruta: pagina.ruta };
}

export async function descartarBorradorEnBase(
  base: PrismaClient,
  slug: string,
  registro: RegistroDePaginas = PAGINAS,
): Promise<{ ok: boolean; detalle: string }> {
  if (!propioDe(registro, slug)) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const { count } = await base.pagina.updateMany({ where: { slug }, data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null } });
  return count === 0
    ? { ok: false, detalle: "Esa página todavía no tiene nada guardado." }
    : { ok: true, detalle: "Se descartó el borrador: la página vuelve a lo publicado." };
}
