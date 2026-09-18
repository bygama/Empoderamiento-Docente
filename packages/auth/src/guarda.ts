import { getSessionCookie } from "better-auth/cookies";

/**
 * La guarda del middleware.
 *
 * **Esto es un filtro, no la verificación.** El middleware de Next corre en el
 * runtime Edge y no puede consultar la base, así que acá solo se mira si la
 * cookie de sesión está. Alguien puede fabricar una cookie con cualquier
 * contenido y pasar este chequeo; lo que no puede es llegar a ver nada,
 * porque la comprobación de verdad —firma, expiración, que la sesión exista—
 * la hace el layout del admin contra la base antes de renderizar.
 *
 * Por qué vale la pena igual: le ahorra a quien no inició sesión un viaje al
 * servidor y una pantalla en blanco, y deja la redirección en un solo lugar.
 */
export function hayCookieDeSesion(req: Request): boolean {
  return getSessionCookie(req) !== null;
}
