import type { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { dondeEsta } from "@/features/novedades/contenido/etiquetas";
import type { Novedad } from "@/features/novedades/contenido/novedad";
import { comoDocumento } from "@/lib/contenido/documento";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import type { Fallo } from "./choque";

// Lo que comparten las escrituras de una novedad (editar-novedades.ts y
// publicar-novedades.ts): los errores en el campo, el slug ocupado, el título
// para la actividad y el pasaje de una novedad a columnas.

/** Una novedad que no pasa su esquema: un error por campo, con el camino del formulario y las etiquetas. */
export function problemasDeNovedad(error: z.ZodError): Fallo {
  const porCamino = new Map<string, ErrorDeCampo>();
  for (const i of error.issues) {
    const camino = i.path.map(String).join(".");
    if (!porCamino.has(camino)) porCamino.set(camino, { camino, donde: dondeEsta(i.path), mensaje: i.message });
  }
  const errores = [...porCamino.values()];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Un solo campo que no pasa, dicho igual que los del esquema. */
export function falloEnCampo(camino: string, mensaje: string): Fallo {
  const errores = [{ camino, donde: dondeEsta(camino.split(".")), mensaje }];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Cómo se llama una novedad en llano, para la actividad y los avisos: su título publicado, el del borrador o «Sin título». */
export function tituloDe(fila: { titulo: string | null; borrador: Prisma.JsonValue }): string {
  const delBorrador = comoDocumento(fila.borrador).titulo;
  return fila.titulo || (typeof delBorrador === "string" && delBorrador.trim()) || "Sin título";
}

/**
 * El título de otra novedad que ya usa ese slug, publicado o en su borrador, o
 * `null` si está libre. La base garantiza el publicado con el índice único;
 * esto avisa antes, en el campo, y también ve los borradores.
 */
export async function slugOcupado(base: PrismaClient | Prisma.TransactionClient, slug: string, menos: string | null): Promise<string | null> {
  const otra = await base.novedad.findFirst({
    where: { id: menos ? { not: menos } : undefined, OR: [{ slug }, { borrador: { path: ["slug"], equals: slug } }] },
    select: { titulo: true, borrador: true },
  });
  return otra ? tituloDe(otra) : null;
}

/**
 * Una novedad válida, lista para sus columnas. Los `as` valen porque cada
 * valor salió de Zod: es JSON válido. Sin cuerpo, la columna queda nula (no
 * hay ficha), igual que sin imagen para redes.
 */
export function columnasDe(n: Novedad) {
  return {
    slug: n.slug,
    titulo: n.titulo,
    bajada: n.bajada,
    fecha: n.fecha,
    categoria: n.categoria,
    imagen: n.imagen as Prisma.InputJsonObject,
    cuerpo: n.cuerpo.length > 0 ? (n.cuerpo as Prisma.InputJsonArray) : Prisma.DbNull,
    destacada: n.destacada,
    publicacion: n.publicacion,
    imagenParaRedes: n.imagenParaRedes ? (n.imagenParaRedes as Prisma.InputJsonObject) : Prisma.DbNull,
  };
}

/**
 * Lo que cambia del borrador de una novedad que deja de ser la destacada:
 * `destacada` en falso, si la tenía. El `as` vale porque el borrador guardado
 * salió de Zod y solo cambia un booleano.
 */
export function borradorSinTapa(borrador: Prisma.JsonValue): { borrador?: Prisma.InputJsonObject } {
  const documento = comoDocumento(borrador);
  return borrador && documento.destacada === true ? { borrador: { ...documento, destacada: false } as Prisma.InputJsonObject } : {};
}

/** El error de Postgres de un índice único (el slug publicado, o la destacada si dos publican a la vez). */
export function esUnicoRepetido(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}
