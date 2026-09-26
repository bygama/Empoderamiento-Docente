import type { GenericEndpointContext } from "better-auth";
import { APIError } from "better-auth/api";
import { CUENTA_SUSPENDIDA } from "./errores";

/**
 * Una cuenta suspendida no abre sesión (SPEC de `work/cuentas/` §2): ni con
 * la contraseña, ni con el código, ni con ninguna otra ruta que cree una. Se
 * mira donde toda sesión nace, en el gancho de la base, así no hay un camino
 * que se olvide. Las que ya tenía se cierran al suspenderla (Cuentas).
 *
 * Solo se entera quien puso bien la contraseña: la sesión se crea después de
 * verificarla. Por eso la pantalla le puede decir en llano qué pasa.
 */

/** La columna que suma la cuenta: la escribe Cuentas, nunca el cliente. */
export const CAMPO_SUSPENDIDA = { type: "boolean", required: false, defaultValue: false, input: false } as const;

export async function frenarSiEstaSuspendida(idDeCuenta: string, ctx: GenericEndpointContext | null): Promise<void> {
  // Una sesión creada fuera de un pedido no tiene a quién preguntarle; en esta app no hay ninguna.
  const cuenta = ctx ? await ctx.context.internalAdapter.findUserById(idDeCuenta) : null;
  if (cuenta && "suspendida" in cuenta && cuenta.suspendida === true) {
    throw new APIError("FORBIDDEN", { code: CUENTA_SUSPENDIDA, message: "La cuenta está suspendida." });
  }
}
