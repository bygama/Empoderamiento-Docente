import { isAPIError } from "better-auth/api";
import { claveDeBloqueo, conUnFalloMas, segundosDeFreno, type AlmacenDeBloqueos } from "./bloqueo";

/**
 * Pedir otra vez la contraseña de quien tiene la sesión, antes de algo que no
 * se deshace solo (pasar la dirección, SPEC de work/cuentas §4.3).
 *
 * `verifyPassword` de better-auth se llama desde el servidor, y desde ahí
 * **saltea el rate limit por IP**: una sesión robada podría probar
 * contraseñas sin freno. Por eso cada fallo cuenta en el **bloqueo por
 * cuenta** (bloqueo.ts, ADR-0010) como un intento de entrar, y una cuenta
 * frenada no se prueba, ni con la contraseña buena.
 */

export type Confirmacion = "bien" | "mal" | "frenada";

type ConVerificar = {
  $context: Promise<{ secret: string }>;
  api: { verifyPassword: (pedido: { headers: Headers; body: { password: string } }) => Promise<unknown> };
};

export async function confirmarContrasena(
  auth: ConVerificar,
  { headers, correo, contrasena, bloqueos }: { headers: Headers; correo: string; contrasena: string; bloqueos: AlmacenDeBloqueos },
): Promise<Confirmacion> {
  // El mismo secreto con que se firman las sesiones: la misma clave que usa entrar.
  const clave = claveDeBloqueo(correo, (await auth.$context).secret);
  const ahora = new Date();
  if (segundosDeFreno(await bloqueos.leer(clave), ahora) !== null) return "frenada";
  try {
    await auth.api.verifyPassword({ headers, body: { password: contrasena } });
  } catch (error) {
    // Solo la contraseña mala es un fallo; otra cosa (la base, la sesión) no es un intento.
    if (!isAPIError(error) || error.body?.code !== "INVALID_PASSWORD") throw error;
    await bloqueos.actualizar(clave, (actual) => conUnFalloMas(actual, ahora));
    return "mal";
  }
  await bloqueos.borrar(clave);
  return "bien";
}
