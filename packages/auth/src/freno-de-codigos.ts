import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { claveDeCodigos, conUnFalloMas, respuestaDeFreno, segundosDeFreno, type AlmacenDeBloqueos } from "./bloqueo";

/**
 * **Los códigos fallidos del segundo factor se cuentan por cuenta**, con el
 * bloqueo de entrar (bloqueo.ts, ADR-0010) y otra clave (`claveDeCodigos`).
 * El plugin da 5 intentos por código, pero cada código nuevo trae otros 5: sin
 * esto, quien ya sabe la contraseña podría pedir códigos y probar sin fin. La
 * contraseña buena no borra estos fallos; el código bueno, sí (ADR-0019).
 *
 * Son dos ganchos de `/two-factor/verify-otp` que van en el plugin de
 * alrededor del código (segundo-factor.ts), después del de `twoFactor`.
 */

const PROBAR = "/two-factor/verify-otp";

type Gancho = NonNullable<NonNullable<BetterAuthPlugin["hooks"]>["before"]>[number];
type Contexto = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

/**
 * De quién es el código que se prueba: de la sesión, si ya hay una (prenderlo
 * desde Mi cuenta), o del paso pendiente entre la contraseña y el código,
 * que better-auth guarda en `verification` con el id de la cuenta y firma en
 * su cookie `two_factor`. Es la misma lectura que hace el plugin.
 */
async function cuentaDelCodigo(ctx: Contexto): Promise<string | null> {
  const sesion = await getSessionFromCtx(ctx).catch(() => null);
  if (sesion) return sesion.user.id;
  const cookie = ctx.context.createAuthCookie("two_factor");
  const paso = await ctx.getSignedCookie(cookie.name, ctx.context.secret);
  if (!paso) return null;
  return (await ctx.context.internalAdapter.findVerificationValue(paso))?.value ?? null;
}

export function frenoDeCodigos({ bloqueos, secreto }: { bloqueos: AlmacenDeBloqueos; secreto: string }): { antes: Gancho; despues: Gancho } {
  return {
    antes: {
      // Una cuenta frenada no prueba códigos, ni el bueno: si no, el freno no frenaría nada.
      matcher: (ctx) => ctx.path === PROBAR,
      handler: createAuthMiddleware(async (ctx) => {
        const cuenta = await cuentaDelCodigo(ctx);
        if (!cuenta) return;
        const segundos = segundosDeFreno(await bloqueos.leer(claveDeCodigos(cuenta, secreto)), new Date());
        if (segundos !== null) throw respuestaDeFreno(segundos);
      }),
    },
    despues: {
      // Solo el código mal es un fallo; otro error (vencido, la cuenta suspendida) no es un intento.
      matcher: (ctx) => ctx.path === PROBAR,
      handler: createAuthMiddleware(async (ctx) => {
        const devuelto = ctx.context.returned;
        const fallo = isAPIError(devuelto) && devuelto.body?.code === "INVALID_CODE";
        if (isAPIError(devuelto) && !fallo) return;
        const cuenta = ctx.context.newSession?.user.id ?? (await cuentaDelCodigo(ctx));
        if (!cuenta) return;
        const clave = claveDeCodigos(cuenta, secreto);
        if (fallo) await bloqueos.actualizar(clave, (actual) => conUnFalloMas(actual, new Date()));
        else await bloqueos.borrar(clave);
      }),
    },
  };
}
