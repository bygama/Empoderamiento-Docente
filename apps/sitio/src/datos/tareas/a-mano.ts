import { base } from "@/datos/cliente";
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
 *
 * **Atómico, a propósito.** Leer la última corrida y después correr deja una
 * ventana: dos clics a la vez leerían los dos «no hay nada reciente» y
 * correrían los dos. Por eso todo pasa dentro de una transacción que toma un
 * advisory lock de Postgres por tarea (`pg_try_advisory_xact_lock`, sin
 * tablas): el segundo clic no lo consigue y contesta que espere, y el lock se
 * suelta solo cuando la transacción termina, después de registrar la corrida.
 * Es de transacción y no de sesión, así que anda igual detrás del pooler de
 * Neon.
 */
export async function correrAMano(clave: string, correr: () => Promise<ResultadoDeTarea>): Promise<ResultadoDeTarea> {
  return base.$transaction(
    async (tx) => {
      const [{ tomado }] = await tx.$queryRaw<{ tomado: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(hashtext('corridas_de_tareas'), hashtext(${clave})) AS tomado`;
      if (!tomado) return { ok: false, detalle: "Ya se está actualizando; esperá un momento." };

      const ultima = await ultimaCorrida(clave);
      const hace = ultima ? Date.now() - ultima.corridaEn.getTime() : Infinity;
      if (hace < FRENO_MS) {
        const minutos = Math.max(1, Math.floor(hace / 60_000));
        return { ok: false, detalle: `La última corrida fue hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}; esperá un rato.` };
      }
      const [corrida] = await correrTareas([{ clave, nombre: clave, correr }], { registrar: registrarCorrida, limiteMs: LIMITE_POR_TAREA_MS });
      return { ok: corrida.ok, detalle: corrida.detalle };
    },
    // La tarea tiene 50 segundos; la transacción, un margen para registrarla.
    { maxWait: 5_000, timeout: LIMITE_POR_TAREA_MS + 10_000 },
  );
}
