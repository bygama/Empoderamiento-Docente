import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { hashear, verificar } from "./contrasenas";
import { crearGanchos, destrabar } from "./ganchos";
import { LARGO_MINIMO_CONTRASENA, ROL_POR_DEFECTO, ROLES } from "./permisos";

/**
 * Arma la sesión. Este paquete **no importa el cliente generado de Prisma**:
 * ese cliente sale del esquema de la app y conocerlo sería saber del dominio
 * (AGENTS.md §3, la primera frontera). La app construye el suyo y lo pasa acá.
 */

const UNA_HORA = 60 * 60;
const UNA_SEMANA = 7 * 24 * 60 * 60;
const UN_DIA = 24 * 60 * 60;

/**
 * El cliente de Prisma que recibe `crearAuth`.
 *
 * **No restringe nada, y conviene saberlo**: se deriva del tipo de better-auth,
 * que declara `interface PrismaClient {}` —una interfaz vacía—, así que acepta
 * cualquier valor no nulo. Es una debilidad de tipado de la librería, no algo
 * que esta frontera verifique. Se deriva igual en vez de inventar una forma
 * propia para no quedar desincronizado cuando la librería la complete.
 */
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
    /** Cuánto dura el enlace, para decirlo en el correo. */
    minutosDeVigencia: number;
  }) => Promise<void>;
  /** Manda el aviso de «tu contraseña cambió». */
  avisarCambioDeContrasena: (datos: { para: string; nombre?: string }) => Promise<void>;
  /**
   * Corre una tarea después de contestar, sin que la respuesta la espere (en
   * Next, `after()`). Los correos salen por acá: si la respuesta esperara al
   * envío, tardaría más cuando el correo existe, y el tiempo lo delataría.
   */
  segundoPlano: (tarea: Promise<unknown>) => void;
  /** Dónde guarda el bloqueo por cuenta sus fallos (bloqueo.ts). */
  bloqueos: AlmacenDeBloqueos;
};

export function crearAuth({
  base,
  secreto,
  urlDelSitio,
  mandarResetDeContrasena,
  avisarCambioDeContrasena,
  segundoPlano,
  bloqueos,
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
      minPasswordLength: LARGO_MINIMO_CONTRASENA,
      maxPasswordLength: 128,
      // Argon2id en vez del scrypt de fábrica; los hashes viejos verifican y
      // se reemplazan al entrar (contrasenas.ts, ganchos.ts).
      password: { hash: hashear, verify: verificar },
      resetPasswordTokenExpiresIn: UNA_HORA,
      sendResetPassword: async ({ user, url }) => {
        await mandarResetDeContrasena({
          para: user.email,
          nombre: user.name || undefined,
          enlace: url,
          minutosDeVigencia: UNA_HORA / 60,
        });
      },
      onPasswordReset: async ({ user }) => {
        await destrabar(bloqueos, user.email, secreto);
        // better-auth espera a este callback antes de contestar, así que el
        // aviso se manda a segundo plano acá mismo.
        segundoPlano(
          avisarCambioDeContrasena({ para: user.email, nombre: user.name || undefined }).catch((e: unknown) => {
            console.error("No salió el aviso de contraseña cambiada:", e instanceof Error ? e.message : e);
          }),
        );
      },
    },

    // El token del enlace de «elegí tu contraseña» se guarda hasheado: quien
    // lea la tabla `verification` (un backup, un log de consultas) no se lleva
    // enlaces que sirvan. Uno pedido antes de este cambio deja de servir; duran
    // una hora.
    verification: { storeIdentifier: "hashed" },

    session: {
      expiresIn: UNA_SEMANA,
      updateAge: UN_DIA,
    },

    /**
     * Rate limit **por IP**, que es lo que faltaba: hasta acá el único freno
     * era por cuenta, así que probar una contraseña contra mil correos
     * distintos no chocaba con nada y dejaba enumerar usuarios a gusto.
     *
     * El límite de `signIn` es deliberadamente más duro que el general: tres
     * intentos por minuto desde una IP frena la fuerza bruta sin molestar a
     * quien escribió mal la contraseña una vez. El de `requestPasswordReset`
     * frena usar el envío de correos como manguera contra buzones ajenos.
     *
     * Lo contrario —muchas IP contra una sola cuenta— lo cubre el bloqueo por
     * cuenta de los `hooks` de abajo (bloqueo.ts).
     */
    rateLimit: {
      enabled: true,
      // En la base (tabla `rateLimit`), no en memoria: en Vercel cada
      // instancia llevaba su propia cuenta y el tope se multiplicaba por la
      // cantidad de instancias vivas.
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 3 },
        // No hay otra ruta que mande este correo: `/forget-password` ya no
        // existe en better-auth 1.7 (solo en el plugin email-otp, que no se
        // usa), y la regla que la limitaba no limitaba nada.
        "/request-password-reset": { window: 300, max: 3 },
        "/reset-password": { window: 300, max: 5 },
      },
    },

    hooks: crearGanchos({ bloqueos, secreto }),

    advanced: {
      // better-auth manda acá el correo del reset (`runInBackgroundOrAwait`).
      backgroundTasks: { handler: segundoPlano },
      ipAddress: {
        // En Vercel la IP real viene acá; sin decirlo, todas las requests
        // parecerían venir del proxy y compartirían un solo cupo.
        ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      },
    },

    user: {
      additionalFields: {
        rol: {
          // `[...ROLES]` satisface el `DBFieldType` de better-auth sin ninguna
          // aserción: el doble cast por `unknown` que había acá apagaba TODA
          // la verificación, y era la causa de que el layout necesitara otro.
          type: [...ROLES],
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
