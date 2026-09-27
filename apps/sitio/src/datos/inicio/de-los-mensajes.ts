import type { Bandeja } from "@/config/mensajes";
import { aLos, bordeDelSpam, vigente, type PlazosDeGuarda } from "@/config/privacidad";
import { base } from "@/datos/cliente";
import { llegoVencido, plazosDeGuarda } from "@/datos/privacidad";

// Lo que el Inicio lee de la tabla `mensajes`. «Sin leer» es lo mismo que el
// número de la sidebar: el estado Nuevo, que nadie tomó. Los plazos, los de
// Ajustes › Privacidad contados como en `config/privacidad.ts`: los mismos que
// la ficha y la tarea que borra.

const DIA_MS = 86_400_000;
export const DIAS_DE_AVISO = 7;

/** Lo que dice una fila con algo pendiente (el tipo de `pendientes.ts`). */
type Fila = { titulo: string; detalle?: string };

/** Los sin leer de una bandeja. */
export function sinLeer(bandeja: Bandeja): Promise<number> {
  return base.mensaje.count({ where: { bandeja, estado: "nuevo" } });
}

/**
 * Los CV que se borran solos de acá a 7 días, o que ya tendrían que haberse
 * borrado: lo que la tarea que borra encontraría vencido dentro de 7 días, el
 * spam incluido. Es `seBorraEl(m) <= hoy + 7 días`, en SQL. `plazos` se pasa
 * para probar con unos fijos.
 */
export async function cvQueSeBorranPronto(hoy: Date = new Date(), plazos?: PlazosDeGuarda): Promise<number> {
  const { cv, spam } = plazos ?? (await plazosDeGuarda());
  const limite = new Date(hoy.getTime() + DIAS_DE_AVISO * DIA_MS);
  return base.mensaje.count({
    where: { bandeja: "cv", OR: [...llegoVencido(cv, limite).OR, { estado: "spam", estadoEn: { lt: bordeDelSpam(spam, limite) } }] },
  });
}

/** Los CV que llegaron en `[desde, hasta)`, en cualquier estado: lo que llegó, llegó. */
export function cvRecibidos(desde: Date, hasta: Date): Promise<number> {
  return base.mensaje.count({ where: { bandeja: "cv", recibidoEn: { gte: desde, lt: hasta } } });
}

/** Lo que llegó a una bandeja después de `desde`, sin lo que ya se marcó como spam. */
export function llegaronDesde(bandeja: Bandeja, desde: Date): Promise<number> {
  return base.mensaje.count({ where: { bandeja, recibidoEn: { gt: desde }, estado: { not: "spam" } } });
}

/** «llegó 1 CV», «llegaron 3 mensajes de contacto», o `null` si no llegó nada: la frase de «desde tu última visita». */
export function fraseDeLlegados(bandeja: Bandeja, n: number): string | null {
  if (n <= 0) return null;
  const que = bandeja === "cv" ? "CV" : n === 1 ? "mensaje de contacto" : "mensajes de contacto";
  return `${n === 1 ? "llegó" : "llegaron"} ${n} ${que}`;
}

const nadie = (n: number) => (n === 1 ? "Nadie lo tomó todavía." : "Nadie los tomó todavía.");

/** «3 CV nuevos», o `null` si no hay ninguno. */
export function filaDeCvNuevos(n: number): Fila | null {
  return n > 0 ? { titulo: n === 1 ? "1 CV nuevo" : `${n} CV nuevos`, detalle: nadie(n) } : null;
}

/** «2 mensajes de contacto sin leer», o `null`. */
export function filaDeMensajesSinLeer(n: number): Fila | null {
  return n > 0 ? { titulo: n === 1 ? "1 mensaje de contacto sin leer" : `${n} mensajes de contacto sin leer`, detalle: nadie(n) } : null;
}

/** «1 CV se borra en 7 días», o `null`. `mesesDeGuarda` es el plazo de los CV que rige hoy. */
export function filaDeCvQueSeBorran(n: number, mesesDeGuarda: number): Fila | null {
  if (n <= 0) return null;
  const titulo = n === 1 ? `1 CV se borra en ${DIAS_DE_AVISO} días` : `${n} CV se borran en ${DIAS_DE_AVISO} días`;
  const cuando = aLos("cv", mesesDeGuarda);
  return { titulo, detalle: `${cuando[0].toUpperCase()}${cuando.slice(1)} de llegar se borran solos, con su archivo.` };
}

/** Las tres lecturas del registro de pendientes. */
export const leerCvNuevos = async () => filaDeCvNuevos(await sinLeer("cv"));
export const leerMensajesSinLeer = async () => filaDeMensajesSinLeer(await sinLeer("contacto"));
export const leerCvQueSeBorran = async () => {
  const plazos = await plazosDeGuarda();
  return filaDeCvQueSeBorran(await cvQueSeBorranPronto(new Date(), plazos), vigente(plazos.cv));
};
