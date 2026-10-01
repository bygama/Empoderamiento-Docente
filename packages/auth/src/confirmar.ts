import { isAPIError } from "better-auth/api";
import { claveDeConfirmacion, conUnFalloMas, segundosDeFreno, type AlmacenDeBloqueos } from "./bloqueo";

/**
 * Pedir otra vez la contraseña de quien tiene la sesión, antes de algo que
 * reparte o recupera acceso (cambiar un correo, dar administra, pasar la
 * dirección: ADR-0019).
 *
 * `verifyPassword` de better-auth se llama desde el servidor, y desde ahí
 * **saltea el rate limit por IP**: una sesión robada podría probar
 * contraseñas sin freno. Por eso cada intento cuenta en un **freno propio de
 * la cuenta** (`claveDeConfirmacion`), con las reglas del de entrar
 * (bloqueo.ts, ADR-0010), y una cuenta frenada no se prueba, ni con la
 * contraseña buena. Es otro freno que el de entrar: el de entrar lo puede
 * trabar desde afuera cualquiera que sepa el correo, y no tiene que trabar
 * esto.
 *
 * El intento se cuenta **antes** de probarlo, en la misma escritura atómica
 * que mira si está frenada: si se mirara antes y se contara después, una
 * ráfaga de intentos a la vez pasaría entera. La buena borra lo contado.
 */

export type Confirmacion = "bien" | "mal" | "frenada";

type ConVerificar = {
  $context: Promise<{ secret: string }>;
  api: { verifyPassword: (pedido: { headers: Headers; body: { password: string } }) => Promise<unknown> };
};

export async function confirmarContrasena(
  auth: ConVerificar,
  { headers, idDeCuenta, contrasena, bloqueos }: { headers: Headers; idDeCuenta: string; contrasena: string; bloqueos: AlmacenDeBloqueos },
): Promise<Confirmacion> {
  const clave = claveDeConfirmacion(idDeCuenta, (await auth.$context).secret);
  const ahora = new Date();
  const antes: { segundos: number | null } = { segundos: null };
  await bloqueos.actualizar(clave, (actual) => {
    antes.segundos = segundosDeFreno(actual, ahora);
    // Frenada, `conUnFalloMas` la deja como estaba.
    return conUnFalloMas(actual, ahora);
  });
  if (antes.segundos !== null) return "frenada";
  try {
    await auth.api.verifyPassword({ headers, body: { password: contrasena } });
  } catch (error) {
    // La mala ya quedó contada. Otra cosa (la base, la sesión) no es una respuesta: sube.
    if (!isAPIError(error) || error.body?.code !== "INVALID_PASSWORD") throw error;
    return "mal";
  }
  await bloqueos.borrar(clave);
  return "bien";
}
