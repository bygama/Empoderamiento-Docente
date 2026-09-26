import type { BetterAuthOptions } from "better-auth";

/**
 * Dónde se abrió cada sesión, para que la persona reconozca las suyas en Mi
 * cuenta. Sale de las cabeceras que Vercel pone en cada pedido; **no se le
 * pregunta a ningún servicio de geo-IP**. Sin ellas (en local nunca están),
 * queda en `null` y la pantalla dice «Ubicación desconocida».
 */

export type Ubicacion = { ciudad: string | null; pais: string | null };

const LARGO_MAXIMO_DE_CIUDAD = 80;

/** La ciudad, que Vercel manda codificada (RFC 3986: «S%C3%A3o%20Paulo»). */
function ciudadDe(cruda: string | null): string | null {
  if (!cruda) return null;
  let ciudad: string;
  try {
    ciudad = decodeURIComponent(cruda);
  } catch {
    return null;
  }
  const limpia = ciudad.replace(/\p{Cc}/gu, "").trim().slice(0, LARGO_MAXIMO_DE_CIUDAD);
  return limpia || null;
}

/** El país, en dos letras (ISO 3166-1). Cualquier otra cosa no es un país. */
function paisDe(crudo: string | null): string | null {
  const pais = crudo?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(pais) ? pais : null;
}

export function ubicacionDelPedido(cabeceras: Headers | undefined): Ubicacion {
  return {
    ciudad: ciudadDe(cabeceras?.get("x-vercel-ip-city") ?? null),
    pais: paisDe(cabeceras?.get("x-vercel-ip-country") ?? null),
  };
}

/** Las dos columnas que la sesión suma a las de better-auth. Las escribe el servidor, nunca el cliente. */
export const CAMPOS_DE_LA_SESION = {
  ciudad: { type: "string", required: false, input: false },
  pais: { type: "string", required: false, input: false },
} as const;

/**
 * Llena la ubicación al crear una sesión: al entrar y cuando cambiar la
 * contraseña abre una nueva. Una sesión creada fuera de un pedido queda sin
 * ubicación.
 */
export const GANCHOS_DE_LA_BASE: BetterAuthOptions["databaseHooks"] = {
  session: {
    create: {
      before: async (sesion, ctx) => ({ data: { ...sesion, ...ubicacionDelPedido(ctx?.headers ?? ctx?.request?.headers) } }),
    },
  },
};
