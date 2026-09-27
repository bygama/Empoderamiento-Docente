import { z } from "zod";
import type { PrismaClient } from "@/../prisma/generado/client";
import { esDelRepositorio } from "@/datos/consultas/fotos";
import { USOS_DE_FOTOS, usosPorFoto } from "@/datos/fotos/registro";
import type { Uso, UsosDeUnModulo } from "@/datos/fotos/uso";
import type { Almacen } from "@/lib/contenido/almacen";

// Editar el alt de una foto y borrarla (`work/casos-aliados-fotos/SPEC.md`
// §3.4), con la base y el almacén inyectados; reemplazar el archivo está en
// reemplazar-foto.ts. Las Server Actions de fotos.ts verifican la sesión y
// llaman acá.

export type Fallo = { ok: false; detalle: string };

const NO_EXISTE: Fallo = { ok: false, detalle: "Esa foto ya no existe: la borraron desde que la abriste." };

export const esquemaAlt = z
  .string({ error: "El texto alternativo es obligatorio." })
  .trim()
  .min(1, "El texto alternativo es obligatorio.")
  .max(200, "El texto alternativo tiene como mucho 200 caracteres.")
  .regex(/^[^\r\n]*$/, "Es un texto de una línea: sin saltos.");

/**
 * Cambia el alt de la biblioteca: la descripción de la foto y el que toma un
 * uso nuevo al elegirla. No toca el de los lugares donde ya está: el alt va
 * con cada uso (SPEC §3.4, propuesta C).
 */
export async function editarAltEnBase(base: PrismaClient, { id, alt }: { id: string; alt: unknown }): Promise<{ ok: true; alt: string } | Fallo> {
  const valido = esquemaAlt.safeParse(alt);
  if (!valido.success) return { ok: false, detalle: valido.error.issues[0]?.message ?? "El texto alternativo no es válido." };
  const { count } = await base.foto.updateMany({ where: { id }, data: { alt: valido.data } });
  return count ? { ok: true, alt: valido.data } : NO_EXISTE;
}

const Y = new Intl.ListFormat("es", { type: "conjunction" });

/** Dónde se usa, en una frase: «Inicio › Hero y Caso 01 › Lámina»; de cuatro en adelante, los tres primeros y cuántos más. */
export function dondeSeUsa(usos: readonly Uso[]): string {
  const lugares = [...new Set(usos.map((u) => u.donde))];
  const primeros = lugares.slice(0, 3);
  const resto = lugares.length - primeros.length;
  return Y.format(resto > 0 ? [...primeros, `${resto} lugar${resto === 1 ? "" : "es"} más`] : primeros);
}

/**
 * Borra la foto, solo si no se usa en ningún lado: ni en el sitio, ni en un
 * borrador, ni en el contenido del código. La fila primero y el archivo
 * después (resguardo 2 del padre): si el archivo no se puede borrar, lo
 * levanta la tarea de los archivos sueltos. Uno de `public/` no se borra
 * desde el sitio: queda en el repositorio.
 */
export async function borrarFotoEnBase(
  base: PrismaClient,
  almacen: Almacen,
  { id, registro = USOS_DE_FOTOS }: { id: string; registro?: readonly UsosDeUnModulo[] },
): Promise<{ ok: true; alt: string; delRepositorio: boolean } | Fallo> {
  const fila = await base.foto.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  const usos = (await usosPorFoto(base, registro)).get(fila.url) ?? [];
  if (usos.length) return { ok: false, detalle: `No se puede borrar: se usa en ${dondeSeUsa(usos)}. Sacala de ahí primero.` };
  const { count } = await base.foto.deleteMany({ where: { id, url: fila.url } });
  if (!count) return NO_EXISTE;
  const delRepositorio = esDelRepositorio(fila.url);
  if (!delRepositorio) {
    try {
      await almacen.borrar(fila.url);
    } catch (e) {
      console.error("borrarFoto: el archivo quedó, lo levanta la tarea de los sueltos:", e instanceof Error ? e.name : "error");
    }
  }
  return { ok: true, alt: fila.alt, delRepositorio };
}
