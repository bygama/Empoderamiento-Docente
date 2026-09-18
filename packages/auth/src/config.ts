import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ROL_POR_DEFECTO, ROLES } from "./permisos";

/**
 * Arma la sesión. Este paquete **no importa el cliente generado de Prisma**:
 * ese cliente sale del esquema de la app y conocerlo sería saber del dominio
 * (AGENTS.md §3, la primera frontera). La app construye el suyo y lo pasa acá.
 */

const UNA_HORA = 60 * 60;
const UNA_SEMANA = 7 * 24 * 60 * 60;
const UN_DIA = 24 * 60 * 60;

/** Lo mínimo que un cliente de Prisma tiene que parecer para servir de base. */
type ClienteDeBase = Parameters<typeof prismaAdapter>[0];

export type OpcionesDeAuth = {
  /** El `PrismaClient` de la app, ya construido con su adaptador. */
  base: ClienteDeBase;
  /** Firma las sesiones. Sin esto no se arranca: no hay valor por defecto. */
  secreto: string;
  /** De dónde se sirve, para armar los links de los correos. Sin barra final. */
  urlDelSitio: string;
  /** Manda el correo de «elegí una contraseña nueva». */
  mandarResetDeContrasena: (datos: {
    para: string;
    nombre?: string;
    enlace: string;
  }) => Promise<void>;
};

export function crearAuth({
  base,
  secreto,
  urlDelSitio,
  mandarResetDeContrasena,
}: OpcionesDeAuth) {
  if (!secreto) {
    throw new Error(
      "Falta el secreto de better-auth. Generá uno con " +
        '`node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"` ' +
        "y ponelo en BETTER_AUTH_SECRET (ver apps/sitio/.env.example).",
    );
  }

  return betterAuth({
    database: prismaAdapter(base, { provider: "postgresql" }),
    secret: secreto,
    baseURL: urlDelSitio,

    // Fuera del sitio no se confía en nadie: sin esto, un origen ajeno puede
    // pedirle al navegador que mande la cookie de sesión.
    trustedOrigins: [urlDelSitio],

    // La telemetría de better-auth viene apagada de fábrica, pero se fija
    // explícita: un default puede cambiar entre versiones y este paquete se
    // actualiza a propósito, no a ciegas.
    telemetry: { enabled: false },

    emailAndPassword: {
      enabled: true,
      // **No hay registro público.** Las cuentas las crea quien administra;
      // cada persona elige su contraseña por «olvidé mi contraseña».
      disableSignUp: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: UNA_HORA,
      sendResetPassword: async ({ user, url }) => {
        await mandarResetDeContrasena({
          para: user.email,
          nombre: user.name || undefined,
          enlace: url,
        });
      },
    },

    session: {
      expiresIn: UNA_SEMANA,
      updateAge: UN_DIA,
    },

    user: {
      additionalFields: {
        rol: {
          type: ROLES as unknown as string[],
          required: false,
          defaultValue: ROL_POR_DEFECTO,
          // **Lo decide el servidor, no el cliente.** Sin esto, alguien podría
          // mandarse el rol en el cuerpo del alta y darse permisos solo.
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof crearAuth>;
