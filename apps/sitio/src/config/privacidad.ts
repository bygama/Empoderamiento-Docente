import { z } from "zod";
import type { Bandeja, EstadoDeMensaje } from "./mensajes";

// Cuánto se guarda lo que llega por los formularios del sitio (SPEC del mapa
// del admin §5.6, ADR-0012 y ADR-0015). Los plazos se editan en Ajustes ›
// Privacidad y viven en `plazos_de_retencion` con su historial; los lee
// `datos/privacidad.ts`. Acá está la política, sin base: los topes, los de
// antes y cómo se cuenta, que es lo mismo para la tarea que borra, la fecha
// «Se borra el…» de cada ficha y el pendiente del Inicio.

/** Lo que se guarda a plazo: lo recibido en cada bandeja (en meses) y lo marcado como spam (en días). */
export const PLAZOS = ["cv", "contacto", "spam"] as const;
export type Plazo = (typeof PLAZOS)[number];

/** Hasta dónde se mueve cada uno en Ajustes › Privacidad: nunca cero (borraría todo), nunca para siempre. */
export const TOPES: Record<Plazo, { nombre: string; minimo: number; maximo: number; unidad: "meses" | "días" }> = {
  cv: { nombre: "CV", minimo: 1, maximo: 24, unidad: "meses" },
  contacto: { nombre: "Contacto", minimo: 1, maximo: 36, unidad: "meses" },
  spam: { nombre: "Spam", minimo: 1, maximo: 90, unidad: "días" },
};

/** Los de antes de Ajustes, los que cargó la migración: el respaldo cuando no hay base. */
export const PLAZOS_INICIALES: Record<Plazo, number> = { cv: 12, contacto: 24, spam: 30 };

const UNO = { meses: "mes", días: "día" } as const;

/** «12 meses», «1 mes», «30 días». */
export function enPalabras(plazo: Plazo, valor: number): string {
  const { unidad } = TOPES[plazo];
  return `${valor} ${valor === 1 ? UNO[unidad] : unidad}`;
}

/** «a los 12 meses», «al mes», «a los 30 días»: cuándo, en una frase. */
export function aLos(plazo: Plazo, valor: number): string {
  return valor === 1 ? `al ${UNO[TOPES[plazo].unidad]}` : `a los ${enPalabras(plazo, valor)}`;
}

const plazo = (p: Plazo) => {
  const { nombre, minimo, maximo, unidad } = TOPES[p];
  const fuera = `«${nombre}» va de ${minimo} a ${maximo} ${unidad}, en números enteros.`;
  return z.number({ error: fuera }).int(fuera).min(minimo, fuera).max(maximo, fuera);
};

/** Lo que se guarda desde Ajustes › Privacidad. */
export const esquemaDePlazos = z.object({ cv: plazo("cv"), contacto: plazo("contacto"), spam: plazo("spam") });
export type Plazos = z.output<typeof esquemaDePlazos>;

/** Un plazo, desde que rige. */
export type Tramo = { desde: Date; valor: number };

/** Lo que rige: el historial de cada bandeja, del más viejo al más nuevo, y el spam de hoy. */
export type PlazosDeGuarda = Record<Bandeja, readonly Tramo[]> & { spam: number };

const DIA_MS = 24 * 60 * 60 * 1000;

/** `desde` menos (o más) tantos meses de calendario, en UTC. */
function correrMeses(desde: Date, meses: number): Date {
  const fecha = new Date(desde);
  fecha.setUTCMonth(fecha.getUTCMonth() + meses);
  return fecha;
}

/** El que rige hoy: el último. */
export function vigente(tramos: readonly Tramo[]): number {
  return tramos[tramos.length - 1].valor;
}

/**
 * El plazo de algo que llegó en `llegada`: **el menor entre el que regía
 * cuando llegó y cualquiera posterior**. Alargar no guarda lo ya recibido más
 * de lo que se le prometió a quien lo mandó; acortar vale para todo.
 */
export function plazoPara(tramos: readonly Tramo[], llegada: Date): number {
  let desde = 0;
  tramos.forEach((t, i) => {
    if (t.desde <= llegada) desde = i;
  });
  return Math.min(...tramos.slice(desde).map((t) => t.valor));
}

/**
 * Lo vencido hoy, tramo por tramo: lo que llegó entre `desde` y `antesDe` ya
 * pasó su plazo. Es `seBorraEl(m) <= hoy` en rangos, para una consulta.
 */
export function vencidos(tramos: readonly Tramo[], hoy: Date): Array<{ desde: Date; antesDe: Date }> {
  return tramos.flatMap((t, i) => {
    const siguiente = tramos[i + 1]?.desde;
    const borde = correrMeses(hoy, -Math.min(...tramos.slice(i).map((x) => x.valor)));
    const antesDe = siguiente && siguiente < borde ? siguiente : borde;
    return antesDe > t.desde ? [{ desde: t.desde, antesDe }] : [];
  });
}

/** Lo marcado como spam antes de esto se borra hoy. */
export function bordeDelSpam(dias: number, hoy: Date): Date {
  return new Date(hoy.getTime() - dias * DIA_MS);
}

/**
 * Cuándo se borra un mensaje: el spam, a los días del spam desde que se
 * marcó; lo demás, al plazo de su bandeja desde que llegó (`plazoPara`). Lo
 * que llegue antes gana: un spam que ya estaba por cumplir su plazo no gana
 * días de más.
 */
export function seBorraEl(m: { bandeja: Bandeja; estado: EstadoDeMensaje; recibidoEn: Date; estadoEn: Date }, plazos: PlazosDeGuarda): Date {
  const porGuarda = correrMeses(m.recibidoEn, plazoPara(plazos[m.bandeja], m.recibidoEn));
  if (m.estado !== "spam") return porGuarda;
  const porSpam = new Date(m.estadoEn.getTime() + plazos.spam * DIA_MS);
  return porSpam < porGuarda ? porSpam : porGuarda;
}
