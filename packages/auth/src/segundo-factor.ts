import { twoFactor } from "better-auth/plugins/two-factor";
import { alrededorDelCodigo, recordarElEnvio } from "./alrededor-del-codigo";
import type { OpcionesDeAuth } from "./opciones";

/**
 * El segundo factor: un código de 6 dígitos por correo, con el plugin de
 * better-auth (SPEC de `work/cuentas/` §5, ADR-0013). Sin app de
 * autenticación ni códigos de respaldo: quien pierde su buzón recupera la
 * cuenta cambiándole el correo desde Cuentas.
 *
 * El plugin guarda el secreto de la app y los códigos de respaldo en la tabla
 * `twoFactor`, que acá queda vacía: el código por correo vive en
 * `verification`, hasheado. Lo que el plugin no hace va en otro, que corre
 * después (alrededor-del-codigo.ts).
 */

export const MINUTOS_DEL_CODIGO = 10;
const MINUTOS_DEL_PASO_PENDIENTE = 30;
const DIAS_DEL_DISPOSITIVO_RECORDADO = 30;

type Opciones = Pick<OpcionesDeAuth, "mandarCodigo" | "registrar" | "bloqueos"> & { secreto: string };

/**
 * Una tupla y no un arreglo: better-auth deduce de cada plugin las columnas que
 * suma a la cuenta (`twoFactorEnabled`), y en un arreglo mezclado las pierde.
 */
export function segundoFactor({ mandarCodigo, registrar, bloqueos, secreto }: Opciones): [ReturnType<typeof twoFactor>, ReturnType<typeof alrededorDelCodigo>] {
  return [
    twoFactor({
      otpOptions: {
        sendOTP: ({ user, otp }, ctx) => {
          const envio = mandarCodigo({ para: user.email, nombre: user.name || undefined, codigo: otp, minutosDeVigencia: MINUTOS_DEL_CODIGO });
          if (ctx) recordarElEnvio(ctx.context, envio);
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
    alrededorDelCodigo({ registrar, bloqueos, secreto }),
  ];
}
