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

/**
 * **Cada intento se cuenta antes de probarlo**, como un fallo pendiente, en la
 * misma escritura atómica que mira si la cuenta está frenada
 * (`AlmacenDeBloqueos.actualizar`): si se mirara antes y se contara después,
 * una ráfaga de intentos a la vez pasaría entera por el control antes de que
 * se contara el primero. Solo el código bueno borra la cuenta; cualquier otro
 * desenlace (mal, vencido, la cuenta suspendida) queda contado.
 */
export function frenoDeCodigos({ bloqueos, secreto }: { bloqueos: AlmacenDeBloqueos; secreto: string }): { antes: Gancho; despues: Gancho } {
  return {
    antes: {
      // Una cuenta frenada no prueba códigos, ni el bueno: si no, el freno no frenaría nada.
      matcher: (ctx) => ctx.path === PROBAR,
      handler: createAuthMiddleware(async (ctx) => {
        const cuenta = await cuentaDelCodigo(ctx);
        if (!cuenta) return;
        const ahora = new Date();
        // Lo que había antes de este intento, visto adentro de la escritura atómica.
        const antes: { segundos: number | null } = { segundos: null };
        await bloqueos.actualizar(claveDeCodigos(cuenta, secreto), (actual) => {
          antes.segundos = segundosDeFreno(actual, ahora);
          // Frenada, `conUnFalloMas` la deja como estaba.
          return conUnFalloMas(actual, ahora);
        });
        if (antes.segundos !== null) throw respuestaDeFreno(antes.segundos);
      }),
    },
    despues: {
      // El código bueno borra lo contado, también el intento que acaba de entrar.
      matcher: (ctx) => ctx.path === PROBAR,
      handler: createAuthMiddleware(async (ctx) => {
        if (isAPIError(ctx.context.returned)) return;
        const cuenta = ctx.context.newSession?.user.id ?? (await cuentaDelCodigo(ctx));
        if (cuenta) await bloqueos.borrar(claveDeCodigos(cuenta, secreto));
      }),
    },
  };
}
