import type { z } from "zod";
import type { Prisma } from "@/../prisma/generado/client";
import type { Aliado } from "@/features/aliados/contenido/aliado";
import { dondeEstaEnElAliado } from "@/features/aliados/contenido/etiquetas";
import { comoDocumento } from "@/lib/contenido/documento";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import type { Fallo } from "./choque";

// Lo que comparten las escrituras de un aliado (editar-aliados.ts,
// publicar-aliados.ts, autorizar-aliados.ts): los errores en el campo, el
// nombre para la actividad y el pasaje del documento a columnas
// (`work/casos-aliados-fotos/SPEC.md` §5).

export const NO_EXISTE: Fallo = { ok: false, detalle: "Ese aliado ya no existe: lo borraron desde que lo abriste." };

/** Un aliado que no pasa su esquema: un error por campo, con el camino del formulario y las etiquetas. */
export function problemasDeAliado(error: z.ZodError): Fallo {
  const porCamino = new Map<string, ErrorDeCampo>();
  for (const i of error.issues) {
    const camino = i.path.map(String).join(".");
    if (!porCamino.has(camino)) porCamino.set(camino, { camino, donde: dondeEstaEnElAliado(i.path), mensaje: i.message });
  }
  const errores = [...porCamino.values()];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Un solo campo que no pasa, dicho igual que los del esquema. */
export function falloEnCampoDelAliado(camino: string, mensaje: string): Fallo {
  const errores = [{ camino, donde: dondeEstaEnElAliado(camino.split(".")), mensaje }];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Cómo se llama un aliado en llano, para la actividad y los avisos: su nombre publicado, el del borrador o «sin nombre». */
export function nombreDelAliado(fila: { nombre: string | null; borrador: Prisma.JsonValue }): string {
  const delBorrador = comoDocumento(fila.borrador).nombre;
  return fila.nombre || (typeof delBorrador === "string" && delBorrador.trim()) || "sin nombre";
}

/** Un aliado válido, listo para sus columnas. El `as` vale porque el logo salió de Zod. Sin URL, nula. */
export function columnasDelAliado(a: Aliado) {
  return { nombre: a.nombre, logo: a.logo as Prisma.InputJsonObject, tamano: a.tamano, url: a.url || null };
}
