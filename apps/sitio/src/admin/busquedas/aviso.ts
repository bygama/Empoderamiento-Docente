import type { EstadoDeBusquedas } from "@/datos/consultas/busquedas";
import { SIN_CONEXION } from "@/lib/busquedas/entorno";

export type AvisoDeCorrida = { tono: "bien" | "error"; texto: string };

/**
 * Qué aviso lleva Búsquedas por la última corrida. Sin conexión, ninguno: el
 * estado vacío ya lo explica. Recién conectado, la última corrida es la de
 * antes, que falló por falta de variables: mostrarla como error sería lo
 * primero que se ve al conectar, así que se lee como una confirmación. Otro
 * fallo, con conexión, es un error de verdad.
 */
export function avisoDeCorrida({ conectado, hastaDia, ultima }: EstadoDeBusquedas): AvisoDeCorrida | null {
  if (!conectado || !ultima || ultima.ok) return null;
  if (ultima.detalle === SIN_CONEXION) {
    return { tono: "bien", texto: `Search Console quedó conectado: la ${hastaDia ? "próxima" : "primera"} copia llega esta noche, o antes con «Actualizar ahora».` };
  }
  return { tono: "error", texto: `La última actualización falló: ${ultima.detalle}` };
}
