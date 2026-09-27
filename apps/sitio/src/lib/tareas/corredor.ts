import type { ResultadoDeTarea, Tarea } from "./registro";

export type Corrida = { clave: string } & ResultadoDeTarea;

function mensajeDe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Una tarea, con su tiempo máximo. Si no termina a tiempo sigue corriendo de
 * fondo (una promesa no se cancela), pero la corrida ya quedó como fallida:
 * así se registra antes de que la función de Vercel se corte entera. Si
 * espera a otra, **la espera cuenta en su tiempo**: el reloj arranca con
 * todas, y la corrida entera sigue cabiendo en la función.
 */
async function correrUna(tarea: Tarea, limiteMs: number, antes?: Promise<unknown>): Promise<Corrida> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const vencida = new Promise<ResultadoDeTarea>((resolver) => {
    reloj = setTimeout(() => resolver({ ok: false, detalle: `No terminó en ${Math.round(limiteMs / 1000)} segundos.` }), limiteMs);
  });
  try {
    const corriendo = antes ? antes.then(() => tarea.correr()) : tarea.correr();
    return { clave: tarea.clave, ...(await Promise.race([corriendo, vencida])) };
  } catch (e) {
    return { clave: tarea.clave, ok: false, detalle: mensajeDe(e) };
  } finally {
    clearTimeout(reloj);
  }
}

/**
 * Corre todas las tareas a la vez y **aisladas**: una que tira o que se cuelga
 * queda fallida y las otras siguen; la que tiene `despuesDe` empieza cuando
 * esa terminó, bien o mal. Cada corrida se le pasa a `registrar`, también
 * las fallidas; si registrar falla, esa corrida lo dice en su detalle y las
 * demás se registran igual.
 */
export async function correrTareas(
  tareas: readonly Tarea[],
  { registrar, limiteMs }: { registrar: (corrida: Corrida) => Promise<void>; limiteMs: number },
): Promise<Corrida[]> {
  const enMarcha = new Map<string, Promise<Corrida>>();
  const corridas = tareas.map((tarea) => {
    const corrida = correrUna(tarea, limiteMs, tarea.despuesDe ? enMarcha.get(tarea.despuesDe) : undefined);
    enMarcha.set(tarea.clave, corrida);
    return corrida;
  });
  return Promise.all(
    corridas.map(async (corriendo) => {
      const corrida = await corriendo;
      try {
        await registrar(corrida);
        return corrida;
      } catch (e) {
        return { ...corrida, detalle: `${corrida.detalle} No se pudo registrar: ${mensajeDe(e)}` };
      }
    }),
  );
}
