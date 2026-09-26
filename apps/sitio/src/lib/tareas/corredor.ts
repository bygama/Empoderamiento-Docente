import type { ResultadoDeTarea, Tarea } from "./registro";

export type Corrida = { clave: string } & ResultadoDeTarea;

function mensajeDe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Una tarea, con su tiempo máximo. Si no termina a tiempo sigue corriendo de
 * fondo (una promesa no se cancela), pero la corrida ya quedó como fallida:
 * así se registra antes de que la función de Vercel se corte entera.
 */
async function correrUna(tarea: Tarea, limiteMs: number): Promise<Corrida> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const vencida = new Promise<ResultadoDeTarea>((resolver) => {
    reloj = setTimeout(() => resolver({ ok: false, detalle: `No terminó en ${Math.round(limiteMs / 1000)} segundos.` }), limiteMs);
  });
  try {
    return { clave: tarea.clave, ...(await Promise.race([tarea.correr(), vencida])) };
  } catch (e) {
    return { clave: tarea.clave, ok: false, detalle: mensajeDe(e) };
  } finally {
    clearTimeout(reloj);
  }
}

/**
 * Corre todas las tareas a la vez y **aisladas**: una que tira o que se cuelga
 * queda fallida y las otras siguen. Cada corrida se le pasa a `registrar`,
 * también las fallidas; si registrar falla, esa corrida lo dice en su detalle
 * y las demás se registran igual.
 */
export async function correrTareas(
  tareas: readonly Tarea[],
  { registrar, limiteMs }: { registrar: (corrida: Corrida) => Promise<void>; limiteMs: number },
): Promise<Corrida[]> {
  return Promise.all(
    tareas.map(async (tarea) => {
      const corrida = await correrUna(tarea, limiteMs);
      try {
        await registrar(corrida);
        return corrida;
      } catch (e) {
        return { ...corrida, detalle: `${corrida.detalle} No se pudo registrar: ${mensajeDe(e)}` };
      }
    }),
  );
}
