import type { Bandeja } from "@/config/mensajes";
import { bordeDeGuarda, bordeDelSpam, MESES_DE_GUARDA } from "@/config/privacidad";
import { base } from "@/datos/cliente";

// Lo que el Inicio lee de la tabla `mensajes`. «Sin leer» es lo mismo que el
// número de la sidebar: el estado Nuevo, que nadie tomó. Los plazos, los de
// `config/privacidad.ts`, los mismos que la ficha y la tarea que borra.

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
 * borrado: los que llegaron hace más de 12 meses menos 7 días, y el spam
 * marcado hace más de 30 menos 7. Es `seBorraEl(m) <= hoy + 7 días`, en SQL.
 */
export function cvQueSeBorranPronto(hoy: Date = new Date()): Promise<number> {
  const limite = new Date(hoy.getTime() + DIAS_DE_AVISO * DIA_MS);
  return base.mensaje.count({
    where: { bandeja: "cv", OR: [{ recibidoEn: { lte: bordeDeGuarda("cv", limite) } }, { estado: "spam", estadoEn: { lte: bordeDelSpam(limite) } }] },
  });
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

/** «1 CV se borra en 7 días», o `null`. */
export function filaDeCvQueSeBorran(n: number): Fila | null {
  if (n <= 0) return null;
  const titulo = n === 1 ? `1 CV se borra en ${DIAS_DE_AVISO} días` : `${n} CV se borran en ${DIAS_DE_AVISO} días`;
  return { titulo, detalle: `A los ${MESES_DE_GUARDA.cv} meses de llegar se borran solos, con su archivo.` };
}

/** Las tres lecturas del registro de pendientes. */
export const leerCvNuevos = async () => filaDeCvNuevos(await sinLeer("cv"));
export const leerMensajesSinLeer = async () => filaDeMensajesSinLeer(await sinLeer("contacto"));
export const leerCvQueSeBorran = async () => filaDeCvQueSeBorran(await cvQueSeBorranPronto());
