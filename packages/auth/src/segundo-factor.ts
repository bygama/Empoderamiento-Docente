import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { twoFactor } from "better-auth/plugins/two-factor";
import { CODIGO_NO_SALIO, SEGUNDO_FACTOR_OBLIGATORIO } from "./errores";
import type { OpcionesDeAuth } from "./opciones";
import { segundoFactorObligatorio } from "./permisos";
import { anotar } from "./sucesos";

/**
 * El segundo factor: un código de 6 dígitos por correo, con el plugin de
 * better-auth (SPEC de `work/cuentas/` §5, ADR-0012). Sin app de
 * autenticación ni códigos de respaldo: quien pierde su buzón recupera la
 * cuenta cambiándole el correo desde Cuentas.
 *
 * El plugin guarda el secreto de la app y los códigos de respaldo en la tabla
 * `twoFactor`, que acá queda vacía: el código por correo vive en
 * `verification`, hasheado.
 */

export const MINUTOS_DEL_CODIGO = 10;
const MINUTOS_DEL_PASO_PENDIENTE = 30;
const DIAS_DEL_DISPOSITIVO_RECORDADO = 30;

type Opciones = Pick<OpcionesDeAuth, "mandarCodigo" | "registrar">;

/**
 * El envío del código de cada pedido, para que el gancho de
 * `/two-factor/send-otp` lo espere. El plugin lo manda a segundo plano y se
 * traga el error; esperar acá es lo único que deja saber si salió.
 */
const envios = new WeakMap<object, Promise<void>>();

const ENTRAR = ["/sign-in/email", "/two-factor/verify-otp"];
const PRENDER = "/two-factor/enable";
const APAGAR = "/two-factor/disable";

/**
 * Lo que pasa alrededor del plugin y el plugin no hace. Va en un plugin propio
 * y después del de `twoFactor` porque better-auth corre los ganchos de la
 * config antes que los de los plugins, y esto tiene que ver lo que el plugin
 * decidió.
 */
function alrededorDelCodigo({ registrar }: Pick<Opciones, "registrar">) {
  return {
    id: "alrededor-del-codigo",
    hooks: {
      before: [
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

/**
 * Una tupla y no un arreglo: better-auth deduce de cada plugin las columnas que
 * suma a la cuenta (`twoFactorEnabled`), y en un arreglo mezclado las pierde.
 */
export function segundoFactor({ mandarCodigo, registrar }: Opciones): [ReturnType<typeof twoFactor>, ReturnType<typeof alrededorDelCodigo>] {
  return [
    twoFactor({
      otpOptions: {
        sendOTP: ({ user, otp }, ctx) => {
          const envio = mandarCodigo({ para: user.email, nombre: user.name || undefined, codigo: otp, minutosDeVigencia: MINUTOS_DEL_CODIGO });
          if (ctx) envios.set(ctx.context, envio);
          return envio;
        },
        period: MINUTOS_DEL_CODIGO,
        // Como los tokens de ADR-0010: quien lea `verification` no se lleva un código que sirva.
        storeOTP: "hashed",
        allowedAttempts: 5,
      },
      // Solo el código por correo: nada de app de autenticación.
      totpOptions: { disable: true },
      // Lo que dura el paso entre la contraseña y el código: más que un
      // código, para que «Mandar otro» sirva después de uno vencido.
      twoFactorCookieMaxAge: MINUTOS_DEL_PASO_PENDIENTE * 60,
      // «Recordar este dispositivo»: es el de fábrica, fijado a propósito.
      trustDeviceMaxAge: DIAS_DEL_DISPOSITIVO_RECORDADO * 24 * 60 * 60,
    }),
    alrededorDelCodigo({ registrar }),
  ];
}
