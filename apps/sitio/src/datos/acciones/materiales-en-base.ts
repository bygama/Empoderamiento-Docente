import type { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { dondeEsta } from "@/features/biblioteca/contenido/etiquetas";
import type { Material } from "@/features/biblioteca/contenido/material";
import { comoDocumento } from "@/lib/contenido/documento";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import type { Fallo } from "./choque";

// Lo que comparten las escrituras de un material (editar-materiales.ts y
// publicar-materiales.ts): los errores en el campo, el DOI ocupado, el título
// para la actividad y el pasaje de un material a sus columnas y sus autorías.

/** Lo que dice Zod de lo que el esquema no nombra con sus palabras: un tipo que no es, algo que el formulario no manda. */
const SIN_FORMA = "El pedido no tiene la forma esperada.";

/** Para `safeParse`: los mensajes del esquema ganan; todo lo demás se marca «sin forma», en vez del inglés de Zod. */
export const sinForma = { error: () => SIN_FORMA };

/**
 * Si el pedido no lo pudo haber armado el formulario, el mensaje en llano para
 * la persona; el detalle técnico —el camino y el código de cada problema, sin
 * los valores— va al log. `null` si los problemas son de los que el formulario
 * muestra en su campo. Hay que haber parseado con `sinForma`.
 */
export function pedidoSinForma(error: z.ZodError, accion: string): string | null {
  const raros = error.issues.filter((i) => i.message === SIN_FORMA);
  if (!raros.length) return null;
  console.warn(`${accion}: pedido sin forma:`, raros.map((i) => `${i.path.join(".") || "(raíz)"} ${i.code}`).join(", "));
  return `${SIN_FORMA} Recargá la página y probá de nuevo.`;
}

/** Un material que no pasa su esquema: un error por campo, con el camino del formulario y las etiquetas. */
export function problemasDeMaterial(error: z.ZodError, accion: string): Fallo {
  const raro = pedidoSinForma(error, accion);
  if (raro) return { ok: false, detalle: raro };
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

type ConTitulo = { titulo: string | null; borrador: Prisma.JsonValue };

/** Cómo se llama un material en llano, para la actividad y los avisos: su título publicado, el del borrador o «Sin título». */
export function tituloDe(fila: ConTitulo): string {
  const delBorrador = comoDocumento(fila.borrador).titulo;
  return fila.titulo || (typeof delBorrador === "string" && delBorrador.trim()) || "Sin título";
}

/**
 * El título de otro material que ya tiene ese DOI, publicado o en su borrador,
 * o `null` si está libre. La base garantiza el publicado con el índice único;
 * esto avisa antes, en el campo, y también ve los borradores.
 */
export async function doiOcupado(base: PrismaClient | Prisma.TransactionClient, doi: string, menos: string | null): Promise<{ id: string; titulo: string } | null> {
  const otro = await base.material.findFirst({
    where: { id: menos ? { not: menos } : undefined, OR: [{ doi }, { borrador: { path: ["doi"], equals: doi } }] },
    select: { id: true, titulo: true, borrador: true },
  });
  return otro ? { id: otro.id, titulo: tituloDe(otro) } : null;
}

/** El aviso de un DOI que ya está, en su campo y con el título del otro. */
export const doiRepetido = (otro: { titulo: string }) => falloEnCampo("doi", `Ese DOI ya está en la Biblioteca: «${otro.titulo}».`);

/**
 * Un material válido, listo para sus columnas. Lo opcional vacío va nulo. Los
 * `as` valen porque la portada salió de Zod: es JSON válido.
 */
export function columnasDe(m: Material) {
  const oNulo = (t: string) => t || null;
  return {
    titulo: m.titulo,
    autores: oNulo(m.autores),
    descripcion: oNulo(m.descripcion),
    tipo: m.tipo,
    tema: m.tema,
    publico: m.publico,
    fecha: m.fecha,
    formato: m.formato,
    paginas: m.paginas,
    portada: m.portada ? (m.portada as Prisma.InputJsonObject) : Prisma.DbNull,
    url: m.url,
    fuente: m.fuente,
    doi: oNulo(m.doi),
    cita: oNulo(m.cita),
    destacado: m.destacado,
    rotulo: oNulo(m.rotulo),
    frase: oNulo(m.frase),
    detalle: oNulo(m.detalle),
  };
}

/** Las filas de `autorias` de un material, en su orden. */
export function autoriasDe(materialId: string, m: Material) {
  return m.autorias.map((a, orden) => ({ materialId, orden, nombre: a.nombre, persona: a.persona }));
}

/** Lo que cambia del borrador de un material que deja de ser destacado: `destacado` en nulo, si lo tenía. */
export function borradorSinLugar(borrador: Prisma.JsonValue): { borrador?: Prisma.InputJsonObject } {
  const documento = comoDocumento(borrador);
  return borrador && (documento.destacado ?? null) !== null ? { borrador: { ...documento, destacado: null } as Prisma.InputJsonObject } : {};
}
