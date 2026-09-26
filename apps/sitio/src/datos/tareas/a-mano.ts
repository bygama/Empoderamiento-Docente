import { correrTareas } from "@/lib/tareas/corredor";
import type { ResultadoDeTarea } from "@/lib/tareas/registro";
import { registrarCorrida, ultimaCorrida } from "./corridas";
import { LIMITE_POR_TAREA_MS } from "./diarias";

// Diez minutos entre una corrida y la siguiente de la misma tarea: cada copia
// usa un token que abre una cuenta entera (Vercel, Google), y «Actualizar
// ahora» es el único disparador a mano.
const FRENO_MS = 10 * 60 * 1000;

/**
 * «Actualizar ahora»: corre una tarea fuera del cron, con el mismo tiempo
 * máximo y el mismo registro. El freno mira la última corrida **de esa
 * tarea**, sea del cron o de un botón: un botón no frena al otro. No verifica
 * la sesión: la acción que lo llama la verificó antes.
 */
export async function correrAMano(clave: string, correr: () => Promise<ResultadoDeTarea>): Promise<ResultadoDeTarea> {
  const ultima = await ultimaCorrida(clave);
  const hace = ultima ? Date.now() - ultima.corridaEn.getTime() : Infinity;
  if (hace < FRENO_MS) {
    const minutos = Math.max(1, Math.floor(hace / 60_000));
    return { ok: false, detalle: `La última corrida fue hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}; esperá un rato.` };
  }
  const [corrida] = await correrTareas([{ clave, nombre: clave, correr }], { registrar: registrarCorrida, limiteMs: LIMITE_POR_TAREA_MS });
  return { ok: corrida.ok, detalle: corrida.detalle };
}
