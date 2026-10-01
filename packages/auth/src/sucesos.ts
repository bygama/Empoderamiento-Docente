import { getSessionFromCtx, isAPIError, type createAuthMiddleware } from "better-auth/api";
import type { OpcionesDeAuth, SucesoDeSesion } from "./opciones";

/**
 * Salir y cambiar la contraseña, vistos desde los ganchos de better-auth
 * (ganchos.ts): se anotan con `registrar` y, al cambiar la contraseña, sale el
 * aviso por correo. Nada de esto puede frenar la respuesta: va en segundo
 * plano y un error queda en el log.
 */

type Contexto = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];
type Registrar = OpcionesDeAuth["registrar"];

/**
 * Una limpieza que sigue a un cambio de contraseña (borrar los enlaces,
 * destrabar la cuenta): se espera, pero si falla queda en el log y no frena
 * nada. La contraseña ya cambió, y lo que importa más —cerrar las otras
 * sesiones y avisar— tiene que pasar igual.
 */
export async function limpiarSinFrenar(que: string, limpiar: () => Promise<unknown>): Promise<void> {
  try {
    await limpiar();
  } catch (e) {
    console.error(`No se pudo ${que} después de cambiar la contraseña:`, e instanceof Error ? e.message : e);
  }
}

/** Anota un suceso sin que la respuesta lo espere ni se entere si falla. */
export async function anotar(ctx: Contexto, registrar: Registrar, suceso: SucesoDeSesion): Promise<void> {
  await ctx.context.runInBackgroundOrAwait(
    registrar(suceso).catch((e: unknown) => {
      console.error(`No se anotó «${suceso.tipo}»:`, e instanceof Error ? e.message : e);
    }),
  );
}

/**
 * Antes de `/sign-out`, porque después la sesión ya no existe y no hay a quién
 * atribuírselo. Si no hay sesión, no hay nada que anotar.
 */
export async function anotarLaSalida(ctx: Contexto, registrar: Registrar): Promise<void> {
  const sesion = await getSessionFromCtx(ctx).catch(() => null);
  if (sesion) await anotar(ctx, registrar, { tipo: "salio", idDeCuenta: sesion.user.id });
}

/** La cuenta que devuelve `/change-password` cuando anduvo, o `null`. */
function cuentaDevuelta(devuelto: unknown): { id: string; email: string; name: string } | null {
  if (isAPIError(devuelto) || typeof devuelto !== "object" || devuelto === null || !("user" in devuelto)) return null;
  const { user } = devuelto;
  if (typeof user !== "object" || user === null || !("id" in user) || !("email" in user)) return null;
  const { id, email } = user;
  const name = "name" in user && typeof user.name === "string" ? user.name : "";
  return typeof id === "string" && typeof email === "string" ? { id, email, name } : null;
}

/**
 * Después de `/change-password` bien: se anota y sale «Tu contraseña cambió»,
 * igual que al elegir una nueva por el enlace de «olvidé». Si alguien la
 * cambió con una sesión robada, el correo es lo que se entera. Y, como al
 * elegirla por el enlace, los enlaces pendientes y los dispositivos
 * recordados dejan de servir.
 */
export async function alCambiarLaContrasena(
  ctx: Contexto,
  { registrar, avisarCambioDeContrasena, borrarEnlaces }: Pick<OpcionesDeAuth, "registrar" | "avisarCambioDeContrasena" | "borrarEnlaces">,
): Promise<void> {
  const cuenta = cuentaDevuelta(ctx.context.returned);
  if (!cuenta) return;
  // Primero el registro y el aviso; la limpieza después, y sin frenar nada.
  await anotar(ctx, registrar, { tipo: "cambio-su-contrasena", idDeCuenta: cuenta.id });
  await ctx.context.runInBackgroundOrAwait(
    avisarCambioDeContrasena({ para: cuenta.email, nombre: cuenta.name || undefined, cuando: new Date() }).catch((e: unknown) => {
      console.error("No salió el aviso de contraseña cambiada:", e instanceof Error ? e.message : e);
    }),
  );
  await limpiarSinFrenar("borrar los enlaces", () => borrarEnlaces(cuenta.id));
}
