import { slug } from "@ed/db";
import type { CanalDeEnlace } from "@/config/metricas";
import { base } from "./cliente";

/**
 * Los links para compartir (tabla `enlaces`, SPEC de work/metricas-completas/
 * §6.4): crear, borrar y buscar por código. El código sale del nombre y no
 * cambia nunca: está pegado en un posteo.
 */

/** Hasta dónde llega el código: más largo no entra cómodo en un posteo. */
export const LARGO_DEL_CODIGO = 40;

/** El código que propone un nombre: su slug hasta 40, o «link» si no queda nada. */
export function codigoDesde(nombre: string): string {
  return slug.desdeTexto(nombre).slice(0, LARGO_DEL_CODIGO).replace(/-+$/, "") || "link";
}

/** Si un texto tiene la forma de un código: lo que no, ni se busca. */
export function pareceCodigo(texto: string): boolean {
  return texto.length > 0 && texto.length <= LARGO_DEL_CODIGO + 4 && slug.esValido(texto);
}

export type Enlace = { id: string; codigo: string; nombre: string; destino: string; canal: string; creadoEn: Date; creadoPor: string };

/** El error de Postgres cuando otra alta tomó el mismo código a la vez. */
const esCodigoTomado = (e: unknown) => (e as { code?: unknown })?.code === "P2002";

/**
 * Crea el link con el primer código libre (`taller`, `taller-2`…). Si otra
 * alta toma el mismo código a la vez, la base lo frena por el índice único y
 * se prueba con el siguiente. Quien llama ya validó los datos.
 */
export async function crearEnlace(datos: { nombre: string; destino: string; canal: CanalDeEnlace; creadoPor: string }): Promise<Enlace> {
  const propuesto = codigoDesde(datos.nombre);
  for (let intento = 1; ; intento++) {
    const tomados = await base.enlace.findMany({ where: { codigo: { startsWith: propuesto } }, select: { codigo: true } });
    try {
      return await base.enlace.create({ data: { ...datos, codigo: slug.libre(propuesto, tomados.map((t) => t.codigo)) } });
    } catch (e) {
      if (!esCodigoTomado(e) || intento === 3) throw e;
    }
  }
}

/** Borra el link y devuelve cómo se llamaba, o `null` si ya no estaba. Sus sumas quedan: son de días pasados. */
export async function borrarEnlace(id: string): Promise<{ nombre: string } | null> {
  const [borrado] = await base.$transaction([base.enlace.findUnique({ where: { id }, select: { nombre: true } }), base.enlace.deleteMany({ where: { id } })]);
  return borrado;
}

/** El link de ese código, o `null`. */
export async function enlacePorCodigo(codigo: string): Promise<Enlace | null> {
  if (!pareceCodigo(codigo)) return null;
  return base.enlace.findUnique({ where: { codigo } });
}
