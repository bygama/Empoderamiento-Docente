import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

/**
 * El cliente del navegador.
 *
 * **Los formularios del admin tienen que pasar por acá y no por una Server
 * Action.** El rate limit por IP vive en el handler HTTP de better-auth, y una
 * Server Action que llame a `auth.api.signInEmail` desde el servidor lo saltea
 * por diseño: para better-auth esa llamada es código nuestro, confiable. Ir por
 * HTTP es lo que hace que el límite exista de verdad.
 */
export function crearClienteDeAuth(urlDelSitio: string) {
  // Sin `onTwoFactorRedirect`: `FormularioEntrar` lee la respuesta y sigue él.
  return createAuthClient({ baseURL: urlDelSitio, plugins: [twoFactorClient()] });
}

export type ClienteDeAuth = ReturnType<typeof crearClienteDeAuth>;
