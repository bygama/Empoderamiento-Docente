import type { Bandeja, EstadoDeMensaje } from "./mensajes";

// Cuánto se guarda lo que llega por los formularios del sitio (SPEC del mapa
// del admin §5.6, ADR-0012). Un solo lugar: de acá leen las tareas que borran,
// la fecha «Se borra el…» de cada ficha y las líneas de privacidad de los
// formularios. Ajustes › Privacidad los va a hacer editables desde acá.

/** Meses que se guarda lo recibido, contados desde que llegó. */
export const MESES_DE_GUARDA: Record<Bandeja, number> = { cv: 12, contacto: 24 };

/** Días que se guarda lo marcado como spam, contados desde que se marcó. */
export const DIAS_DE_SPAM = 30;

const DIA_MS = 24 * 60 * 60 * 1000;

/** `desde` menos (o más) tantos meses de calendario, en UTC. */
function correrMeses(desde: Date, meses: number): Date {
  const fecha = new Date(desde);
  fecha.setUTCMonth(fecha.getUTCMonth() + meses);
  return fecha;
}

/** Lo recibido antes de esto, en esa bandeja, se borra hoy. */
export function bordeDeGuarda(bandeja: Bandeja, hoy: Date): Date {
  return correrMeses(hoy, -MESES_DE_GUARDA[bandeja]);
}

/** Lo marcado como spam antes de esto se borra hoy. */
export function bordeDelSpam(hoy: Date): Date {
  return new Date(hoy.getTime() - DIAS_DE_SPAM * DIA_MS);
}

/**
 * Cuándo se borra un mensaje: el spam, a los 30 días de marcado; lo demás, a
 * los meses de su bandeja desde que llegó. Lo que llegue antes gana: un spam
 * que ya estaba por cumplir su plazo no gana 30 días más.
 */
export function seBorraEl(m: { bandeja: Bandeja; estado: EstadoDeMensaje; recibidoEn: Date; estadoEn: Date }): Date {
  const porGuarda = correrMeses(m.recibidoEn, MESES_DE_GUARDA[m.bandeja]);
  if (m.estado !== "spam") return porGuarda;
  const porSpam = new Date(m.estadoEn.getTime() + DIAS_DE_SPAM * DIA_MS);
  return porSpam < porGuarda ? porSpam : porGuarda;
}
