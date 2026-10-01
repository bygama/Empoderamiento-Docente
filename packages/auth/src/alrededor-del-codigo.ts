import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { CODIGO_NO_SALIO, SEGUNDO_FACTOR_OBLIGATORIO } from "./errores";
import { frenoDeCodigos } from "./freno-de-codigos";
import type { OpcionesDeAuth } from "./opciones";
import { segundoFactorObligatorio } from "./permisos";
import { anotar } from "./sucesos";

/**
 * Lo que pasa alrededor del plugin del segundo factor (segundo-factor.ts) y el
 * plugin no hace. Va en un plugin propio y después del de `twoFactor` porque
 * better-auth corre los ganchos de la config antes que los de los plugins, y
 * esto tiene que ver lo que el plugin decidió. Los códigos fallidos se cuentan
 * por cuenta (freno-de-codigos.ts).
 */

/**
 * El envío del código de cada pedido, para que el gancho de
 * `/two-factor/send-otp` lo espere. El plugin lo manda a segundo plano y se
 * traga el error; esperar acá es lo único que deja saber si salió.
 */
const envios = new WeakMap<object, Promise<void>>();

/** Lo llama el `sendOTP` del plugin con el contexto del pedido. */
export function recordarElEnvio(contexto: object, envio: Promise<void>): void {
  envios.set(contexto, envio);
}

const PROBAR = "/two-factor/verify-otp";
const ENTRAR = ["/sign-in/email", PROBAR];
const PRENDER = "/two-factor/enable";
const APAGAR = "/two-factor/disable";

export function alrededorDelCodigo({ registrar, bloqueos, secreto }: Pick<OpcionesDeAuth, "registrar" | "bloqueos"> & { secreto: string }) {
  const freno = frenoDeCodigos({ bloqueos, secreto });
  return {
    id: "alrededor-del-codigo",
    hooks: {
      before: [
        freno.antes,
        {
          // Para dirige y administra es obligatorio: no se apaga. Bajar de rol
          // no lo apaga tampoco; lo apaga la persona, si quiere, después.
          matcher: (ctx) => ctx.path === APAGAR,
          handler: createAuthMiddleware(async (ctx) => {
            const sesion = await getSessionFromCtx(ctx).catch(() => null);
            const rol: unknown = sesion && "rol" in sesion.user ? sesion.user.rol : undefined;
            if (segundoFactorObligatorio(rol)) {
              throw new APIError("FORBIDDEN", { code: SEGUNDO_FACTOR_OBLIGATORIO, message: "Para tu rol el segundo factor es obligatorio." });
            }
          }),
        },
      ],
      after: [
        freno.despues,
        {
          // «Entró» es cuando la sesión existe de verdad: con la contraseña si
          // no hay segundo factor o el dispositivo está recordado, o con el
          // código. Quien pone bien la contraseña y nunca el código no entró.
          matcher: (ctx) => ENTRAR.includes(ctx.path ?? ""),
          handler: createAuthMiddleware(async (ctx) => {
            const sesion = ctx.context.newSession;
            if (sesion) await anotar(ctx, registrar, { tipo: "entro", idDeCuenta: sesion.user.id });
          }),
        },
        {
          matcher: (ctx) => ctx.path === "/two-factor/send-otp",
          handler: createAuthMiddleware(async (ctx) => {
            const envio = envios.get(ctx.context);
            if (!envio) return;
            const salio = await envio.then(
              () => true,
              () => false,
            );
            if (!salio) throw new APIError("SERVICE_UNAVAILABLE", { code: CODIGO_NO_SALIO, message: "No se pudo mandar el código." });
          }),
        },
        {
          // Prender y apagar crean una sesión nueva: la de la persona que lo hizo.
          matcher: (ctx) => ctx.path === PRENDER || ctx.path === APAGAR,
          handler: createAuthMiddleware(async (ctx) => {
            const sesion = ctx.context.newSession;
            if (isAPIError(ctx.context.returned) || !sesion) return;
            const tipo = ctx.path === PRENDER ? "activo-el-segundo-factor" : "desactivo-el-segundo-factor";
            await anotar(ctx, registrar, { tipo, idDeCuenta: sesion.user.id });
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
}
