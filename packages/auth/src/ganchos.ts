import { createAuthMiddleware } from "better-auth/api";
import {
  OLVIDO,
  claveDeBloqueo,
  claveDeCodigos,
  claveDeConfirmacion,
  contarUnIntento,
  respuestaDeFreno,
  type AlmacenDeBloqueos,
} from "./bloqueo";
import { hashear, necesitaRehash } from "./contrasenas";
import { RUTAS_QUE_ELIGEN_CONTRASENA, frenarSiEstaFiltrada } from "./filtradas";
import type { OpcionesDeAuth } from "./opciones";
import { alCambiarLaContrasena, anotarLaSalida } from "./sucesos";

/**
 * Lo que corre alrededor de «entrar» (`/sign-in/email`), que better-auth no
 * trae y que tiene que pasar en el servidor, no en el formulario: el bloqueo
 * por cuenta (bloqueo.ts) y el paso de scrypt a Argon2id (contrasenas.ts).
 * Y lo que se anota de la sesión: salir y cambiar la contraseña (sucesos.ts).
 * Antes de elegir una contraseña, que no esté filtrada (filtradas.ts).
 * Entrar no se anota acá: con el segundo factor, la contraseña buena todavía
 * no es una sesión, y eso lo decide el plugin, que corre después
 * (segundo-factor.ts).
 */

const ENTRAR = "/sign-in/email";
const SALIR = "/sign-out";
const CAMBIAR_LA_CONTRASENA = "/change-password";

type Contexto = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

export type OpcionesDeGanchos = { bloqueos: AlmacenDeBloqueos; secreto: string } & Pick<
  OpcionesDeAuth,
  "registrar" | "avisarCambioDeContrasena" | "borrarEnlaces"
>;

/**
 * Pasa a Argon2id el hash de quien acaba de entrar bien, si todavía es el
 * scrypt viejo. Es el único momento en que la contraseña llega en claro, así
 * que no hay otro: la migración ocurre sola, cuenta por cuenta. Va en segundo
 * plano para no demorar el login.
 */
function rehashearSiHaceFalta(ctx: Contexto, idDeCuenta: string, contrasena: string) {
  const { internalAdapter } = ctx.context;
  return ctx.context.runInBackgroundOrAwait(
    (async () => {
      const credencial = await internalAdapter.findCredentialAccount(idDeCuenta);
      if (!credencial?.password || !necesitaRehash(credencial.password)) return;
      await internalAdapter.updatePassword(idDeCuenta, await hashear(contrasena));
    })(),
  );
}

/**
 * Un reset de contraseña completo destraba la cuenta: para entrar, para
 * probar códigos y para confirmar la contraseña con la sesión abierta. Quien
 * lo hizo probó que tiene el buzón, que es adonde van los códigos, y eligió
 * la contraseña que se confirma.
 */
export async function destrabar(bloqueos: AlmacenDeBloqueos, cuenta: { id: string; email: string }, secreto: string): Promise<void> {
  await bloqueos.borrar(claveDeBloqueo(cuenta.email, secreto));
  await bloqueos.borrar(claveDeCodigos(cuenta.id, secreto));
  await bloqueos.borrar(claveDeConfirmacion(cuenta.id, secreto));
}

export function crearGanchos({ bloqueos, secreto, registrar, avisarCambioDeContrasena, borrarEnlaces }: OpcionesDeGanchos) {
  function claveDe(ctx: Contexto): string | null {
    const correo: unknown = ctx.body?.email;
    return typeof correo === "string" ? claveDeBloqueo(correo, secreto) : null;
  }

  return {
    // Antes de mirar la contraseña: una cuenta frenada no se prueba, ni con
    // la contraseña buena. Si no, el freno no frenaría nada.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === SALIR) return anotarLaSalida(ctx, registrar);
      // Antes de la ruta, para que una filtrada no gaste el enlace (filtradas.ts).
      if (RUTAS_QUE_ELIGEN_CONTRASENA.includes(ctx.path ?? "")) return frenarSiEstaFiltrada(ctx);
      const clave = ctx.path === ENTRAR ? claveDe(ctx) : null;
      if (!clave) return;
      // Cada intento se cuenta antes de probar la contraseña (`contarUnIntento`):
      // si no, una ráfaga a la vez pasaría entera antes del primer fallo
      // contado. Igual para un correo que no existe: el freno no lo delata.
      const segundos = await contarUnIntento(bloqueos, clave);
      if (segundos !== null) throw respuestaDeFreno(segundos);
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === CAMBIAR_LA_CONTRASENA) return alCambiarLaContrasena(ctx, { registrar, avisarCambioDeContrasena, borrarEnlaces });
      const clave = ctx.path === ENTRAR ? claveDe(ctx) : null;
      if (!clave) return;
      const sesion = ctx.context.newSession;
      if (sesion) {
        // La contraseña buena limpia los fallos y la escalera, también el
        // intento recién contado: era la persona, pida o no el código después.
        await bloqueos.borrar(clave);
        const contrasena: unknown = ctx.body?.password;
        if (typeof contrasena === "string") await rehashearSiHaceFalta(ctx, sesion.user.id, contrasena);
        return;
      }
      // Lo demás ya quedó contado. Con cada fallo se podan las filas quietas.
      await ctx.context.runInBackgroundOrAwait(bloqueos.podar(new Date(Date.now() - OLVIDO)));
    }),
  };
}
