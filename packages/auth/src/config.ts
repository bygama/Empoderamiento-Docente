import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { hashear, verificar } from "./contrasenas";
import { crearGanchos, destrabar } from "./ganchos";
import type { OpcionesDeAuth } from "./opciones";
import { LARGO_MINIMO_CONTRASENA, ROL_POR_DEFECTO, ROLES } from "./permisos";
import { segundoFactor } from "./segundo-factor";
import { CAMPO_SUSPENDIDA } from "./suspendidas";
import { CAMPOS_DE_LA_SESION, GANCHOS_DE_LA_BASE } from "./ubicacion";

/**
 * Arma la sesión. Este paquete **no importa el cliente generado de Prisma**:
 * ese cliente sale del esquema de la app y conocerlo sería saber del dominio
 * (AGENTS.md §3, la primera frontera). La app construye el suyo y lo pasa acá.
 */

const UNA_HORA = 60 * 60;

/**
 * Todo lo de la sesión menos la base. Aparte de `crearAuth` para que los tests
 * corran esta misma config contra el adaptador en memoria de better-auth, y no
 * una copia que se desfase.
 */
export function configDeAuth({
  secreto,
  urlDelSitio,
  mandarResetDeContrasena,
  avisarCambioDeContrasena,
  mandarCodigo,
  segundoPlano,
  bloqueos,
  borrarEnlaces,
  registrar,
}: Omit<OpcionesDeAuth, "base">) {
  if (!secreto) {
    throw new Error(
      "Falta el secreto de better-auth. Generá uno con " +
        '`node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"` ' +
        "y ponelo en BETTER_AUTH_SECRET (ver apps/sitio/.env.example).",
    );
  }

  return {
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
      // Elegir una contraseña nueva cierra todas las sesiones de la cuenta: si
      // alguien se había metido, se queda afuera.
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await mandarResetDeContrasena({
          para: user.email,
          nombre: user.name || undefined,
          enlace: url,
          minutosDeVigencia: UNA_HORA / 60,
        });
      },
      onPasswordReset: async ({ user }) => {
        // Los otros enlaces que tuviera (otro reset, la invitación) y los
        // dispositivos recordados dejan de servir: la contraseña de antes ya
        // no es la llave, y lo que se abrió con ella tampoco.
        await borrarEnlaces(user.id);
        await destrabar(bloqueos, user.email, secreto);
        // better-auth espera a este callback antes de contestar, así que el
        // registro y el aviso van a segundo plano acá mismo.
        segundoPlano(
          registrar({ tipo: "cambio-su-contrasena", idDeCuenta: user.id }).catch((e: unknown) => {
            console.error("No se anotó «cambio-su-contrasena»:", e instanceof Error ? e.message : e);
          }),
        );
        segundoPlano(
          avisarCambioDeContrasena({ para: user.email, nombre: user.name || undefined, cuando: new Date() }).catch((e: unknown) => {
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

    /**
     * Una sesión dura 12 horas sin uso: una jornada. Cada hora de uso la
     * renueva (`updateAge`), así que quien trabaja no se queda afuera a mitad
     * de algo, y una computadora olvidada abierta se cierra sola a la noche.
     * `freshAge`: las rutas que better-auth marca como frescas (listar las
     * sesiones por su API, borrar la cuenta) piden haber entrado hace menos de
     * 10 minutos. Cambiar la contraseña no: pide la actual.
     */
    session: {
      expiresIn: 12 * UNA_HORA,
      updateAge: UNA_HORA,
      freshAge: 10 * 60,
      // Dónde se abrió cada una, de las cabeceras de Vercel (ubicacion.ts).
      additionalFields: CAMPOS_DE_LA_SESION,
    },
    databaseHooks: GANCHOS_DE_LA_BASE,

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
        // Pide la contraseña actual: sin límite propio, una sesión robada la
        // podría probar a razón del tope general, 60 por minuto.
        "/change-password": { window: 300, max: 5 },
        // El segundo factor (segundo-factor.ts): pedir otro código, probarlo,
        // y prenderlo o apagarlo, que piden la contraseña como el de arriba.
        "/two-factor/send-otp": { window: 600, max: 5 },
        "/two-factor/verify-otp": { window: 300, max: 10 },
        "/two-factor/enable": { window: 300, max: 5 },
        "/two-factor/disable": { window: 300, max: 5 },
      },
    },

    plugins: segundoFactor({ mandarCodigo, registrar }),

    hooks: crearGanchos({ bloqueos, secreto, registrar, avisarCambioDeContrasena, borrarEnlaces }),

    advanced: {
      // better-auth manda acá el correo del reset (`runInBackgroundOrAwait`).
      backgroundTasks: { handler: segundoPlano },
      /**
       * `SameSite=Strict`: la cookie de sesión no viaja en nada que empiece
       * en otro sitio, ni siquiera en un link. Es la defensa de CSRF que no
       * depende de que el origen se valide bien. El costo: quien llega al
       * admin desde un link de un correo no la manda en esa navegación, y
       * por eso el proxy de la app rebota esa navegación a la misma URL: la
       * segunda vuelta ya es del mismo sitio y la lleva. `__Host-` no se
       * puede: better-auth 1.7 siempre antepone `__Secure-`.
       */
      defaultCookieAttributes: { sameSite: "strict" },
      ipAddress: {
        // La IP real la pone el proxy de delante en x-real-ip, **pisando**
        // la que mande el cliente: el borde de Vercel y Caddy en el VPS.
        // x-forwarded-for no se lee: según quién esté delante, a la izquierda
        // viene lo que escribió el cliente. Es la misma cabecera que usan los
        // cupos de los formularios (lib/formularios/limite.ts). Confiar en ella
        // es seguro solo si nadie le habla a la app sin pasar por ese proxy.
        ipAddressHeaders: ["x-real-ip"],
        // Una IPv6 cuenta por su /64: es el de fábrica, fijado a propósito.
        ipv6Subnet: 64,
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
        suspendida: CAMPO_SUSPENDIDA,
      },
    },
  } satisfies Omit<BetterAuthOptions, "database">;
}

export function crearAuth({ base, ...opciones }: OpcionesDeAuth) {
  return betterAuth({ database: prismaAdapter(base, { provider: "postgresql" }), ...configDeAuth(opciones) });
}

export type Auth = ReturnType<typeof crearAuth>;
