import { createAuthMiddleware } from "better-auth/api";
import { hashear, necesitaRehash } from "./contrasenas";

/**
 * Lo que corre alrededor de «entrar» (`/sign-in/email`), que better-auth no
 * trae y que tiene que pasar en el servidor, no en el formulario.
 */

const ENTRAR = "/sign-in/email";

type Contexto = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

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

export function crearGanchos() {
  return {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== ENTRAR) return;
      const sesion = ctx.context.newSession;
      const contrasena: unknown = ctx.body?.password;
      if (sesion && typeof contrasena === "string") await rehashearSiHaceFalta(ctx, sesion.user.id, contrasena);
    }),
  };
}
