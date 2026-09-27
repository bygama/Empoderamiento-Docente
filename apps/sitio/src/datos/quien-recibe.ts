import { puede } from "@ed/auth";
import { AVISOS, type ClaveDeAviso } from "@/config/avisos";
import { recibe } from "./avisos";
import { base } from "./cliente";

/**
 * Quién recibe un aviso, puesto desde Ajustes › Avisos (tabla `avisos`, la
 * misma que Mi cuenta). Toca solo las cuentas que la pantalla mostró: una que
 * apareció después de abrirla (una invitación nueva) sigue como venía, y no
 * se apaga sin que nadie la haya visto.
 */

export type CuentaParaElPlan = { id: string; rol: string; filas: ReadonlyArray<{ aviso: string; activo: boolean }> };

/**
 * Qué cambia al dejar el aviso prendido para las `elegidas` y apagado para
 * las demás cuentas que lo pueden recibir; una que no puede recibirlo no
 * cuenta. Puro, para medirlo sin la base.
 */
export function planDeQuienRecibe(
  aviso: ClaveDeAviso,
  cuentas: readonly CuentaParaElPlan[],
  elegidas: ReadonlySet<string>,
): { reciben: number; cambian: Array<{ id: string; activo: boolean }> } {
  const pueden = cuentas.filter((c) => puede(c.rol, AVISOS[aviso].capacidad));
  // Sin fila, vale lo de fábrica: cambia la que queda distinta de como está.
  const cambian = pueden.filter((c) => recibe(aviso, c.filas) !== elegidas.has(c.id)).map((c) => ({ id: c.id, activo: elegidas.has(c.id) }));
  return { reciben: pueden.filter((c) => elegidas.has(c.id)).length, cambian };
}

/**
 * Deja ese aviso prendido para las `elegidas` y apagado para las demás de las
 * `mostradas`, y devuelve cuántas lo reciben y cuántas cambiaron. Quien llama
 * ya chequeó `usarAjustes`.
 *
 * **La lectura y la escritura van en una transacción, con las cuentas
 * trabadas** (`FOR KEY SHARE`): una cuenta que se borra mientras tanto espera a
 * que esto termine, y la que ya se había borrado no aparece. Leer y escribir
 * sueltos dejaba una ventana en la que una cuenta borrada en el medio hacía
 * fallar la acción entera por la clave foránea. `antesDeEscribir` existe para
 * abrir esa ventana en un test.
 */
export async function ponerQuienRecibe(
  aviso: ClaveDeAviso,
  { mostradas, elegidas }: { mostradas: readonly string[]; elegidas: readonly string[] },
  { antesDeEscribir }: { antesDeEscribir?: () => Promise<void> } = {},
): Promise<{ reciben: number; cambiaron: number }> {
  const enPantalla = new Set(mostradas);
  const elegidasMostradas = new Set(elegidas.filter((id) => enPantalla.has(id)));
  return base.$transaction(async (tx) => {
    const cuentas = await tx.$queryRaw<Array<{ id: string; rol: string }>>`
      SELECT id, rol FROM "user" WHERE id = ANY(${[...mostradas]}::text[]) AND NOT suspendida FOR KEY SHARE`;
    const filas = await tx.aviso.findMany({ where: { aviso, cuentaId: { in: cuentas.map((c) => c.id) } }, select: { cuentaId: true, aviso: true, activo: true } });
    const plan = planDeQuienRecibe(aviso, cuentas.map((c) => ({ ...c, filas: filas.filter((f) => f.cuentaId === c.id) })), elegidasMostradas);
    await antesDeEscribir?.();
    await Promise.all(
      plan.cambian.map(({ id, activo }) =>
        tx.aviso.upsert({ where: { cuentaId_aviso: { cuentaId: id, aviso } }, create: { cuentaId: id, aviso, activo }, update: { activo } }),
      ),
    );
    return { reciben: plan.reciben, cambiaron: plan.cambian.length };
  });
}
