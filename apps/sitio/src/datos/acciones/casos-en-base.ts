import type { z } from "zod";
import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import type { Caso } from "@/features/investigacion/contenido/caso";
import { dondeEstaEnElCaso } from "@/features/investigacion/contenido/etiquetas-de-casos";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import type { Fallo } from "./choque";

// Lo que comparten las escrituras de un caso (editar-casos.ts y
// publicar-casos.ts): los errores en el campo, la URL ocupada y el pasaje del
// documento a columnas (`work/casos-aliados-fotos/SPEC.md` §4).

/** Un caso que no pasa su esquema: un error por campo, con el camino del formulario y las etiquetas. */
export function problemasDeCaso(error: z.ZodError): Fallo {
  const porCamino = new Map<string, ErrorDeCampo>();
  for (const i of error.issues) {
    const camino = i.path.map(String).join(".");
    if (!porCamino.has(camino)) porCamino.set(camino, { camino, donde: dondeEstaEnElCaso(i.path), mensaje: i.message });
  }
  const errores = [...porCamino.values()];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Un solo campo que no pasa, dicho igual que los del esquema. */
export function falloEnCampoDelCaso(camino: string, mensaje: string): Fallo {
  const errores = [{ camino, donde: dondeEstaEnElCaso(camino.split(".")), mensaje }];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/**
 * El número del otro caso que ya usa ese slug, publicado o en su borrador, o
 * `null` si está libre. La base garantiza el publicado con el índice único;
 * esto avisa antes, en el campo, y también ve los borradores.
 */
export async function slugDeOtroCaso(base: PrismaClient | Prisma.TransactionClient, slug: string, menos: string): Promise<string | null> {
  const otro = await base.caso.findFirst({ where: { id: { not: menos }, OR: [{ slug }, { borrador: { path: ["slug"], equals: slug } }] }, select: { numero: true } });
  return otro ? `Caso ${otro.numero}` : null;
}

/** Un caso válido, listo para sus columnas. Los `as` valen porque cada valor salió de Zod: es JSON válido. Sin aclaración, nula. */
export function columnasDeCaso(c: Caso) {
  return {
    slug: c.slug,
    pregunta: c.pregunta,
    eje: c.eje,
    indicio: c.indicio,
    periodo: c.periodo,
    ambito: c.ambito,
    estado: c.estado,
    contexto: c.contexto,
    preguntaInvestigacion: c.preguntaInvestigacion,
    lamina: c.lamina as Prisma.InputJsonObject,
    evidencias: c.evidencias as Prisma.InputJsonArray,
    analisis: c.analisis,
    aprendizaje: c.aprendizaje,
    queCambio: c.queCambio,
    produccionRelacionada: c.produccionRelacionada as Prisma.InputJsonArray,
    esDemo: c.esDemo,
    aclaracion: c.aclaracion || null,
  };
}

/** La ficha pública de un caso (la de la fase 4): es la ruta del 308 cuando cambia el slug. */
export const rutaDelCaso = (slug: string) => `/investigacion/casos/${slug}`;
