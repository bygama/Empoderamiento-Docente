import { createHash } from "node:crypto";
import { APIError, type createAuthMiddleware } from "better-auth/api";
import { CONTRASENA_FILTRADA, CONTRASENA_SIN_REVISAR } from "./errores";

/**
 * Una contraseña que aparece en filtraciones de otros sitios no se elige: es
 * de las primeras que prueba quien ataca. Se le pregunta a Have I Been Pwned
 * por rango (k-anonimato): viajan los 5 primeros caracteres del SHA-1 de la
 * contraseña, nunca ella ni su hash entero, y la respuesta trae relleno
 * (`Add-Padding`) para que su largo no diga nada.
 *
 * **Se mira antes de la ruta, en un gancho**, y no dentro de ella: better-auth
 * gasta el enlace de `/reset-password` antes de hashear la contraseña nueva,
 * así que un rechazo desde adentro dejaba el enlace usado. Así, una filtrada o
 * un servicio caído no gastan nada y el mismo enlace sirve para probar otra.
 *
 * Si el servicio no contesta en 3 segundos, o contesta mal, **no se guarda**:
 * 503 y el formulario pide probar de nuevo en un rato.
 */

const RANGO = "https://api.pwnedpasswords.com/range/";
const ESPERA = 3_000;
/** Donde se elige una contraseña: el enlace de «olvidé» y la invitación, y Mi cuenta. */
export const RUTAS_QUE_ELIGEN_CONTRASENA = ["/reset-password", "/change-password"];

type Contexto = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

/** Si la contraseña aparece en filtraciones. Tira si el servicio no contesta bien. */
export async function estaFiltrada(contrasena: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(contrasena).digest("hex").toUpperCase();
  const respuesta = await fetch(`${RANGO}${sha1.slice(0, 5)}`, { headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(ESPERA) });
  if (!respuesta.ok) throw new Error(`Have I Been Pwned contestó ${respuesta.status}`);
  const sufijo = sha1.slice(5);
  return (await respuesta.text()).split(/\r?\n/).some((linea) => {
    const [otro = "", veces = ""] = linea.trim().split(":");
    // Las del relleno vienen con 0: no son de nadie.
    return otro.toUpperCase() === sufijo && Number(veces) > 0;
  });
}

/**
 * El gancho de antes de `/reset-password` y `/change-password`. Una contraseña
 * fuera de los largos permitidos pasa: la rechaza better-auth, con su propio
 * error, sin preguntarle a nadie.
 */
export async function frenarSiEstaFiltrada(ctx: Contexto): Promise<void> {
  const nueva: unknown = ctx.body?.newPassword;
  const { minPasswordLength, maxPasswordLength } = ctx.context.password.config;
  if (typeof nueva !== "string" || nueva.length < minPasswordLength || nueva.length > maxPasswordLength) return;
  let filtrada: boolean;
  try {
    filtrada = await estaFiltrada(nueva);
  } catch (e) {
    console.error("No se pudo revisar si la contraseña está filtrada:", e instanceof Error ? e.message : e);
    throw new APIError("SERVICE_UNAVAILABLE", { code: CONTRASENA_SIN_REVISAR, message: "No se pudo revisar la contraseña. Probá de nuevo en un rato." });
  }
  if (filtrada) {
    throw new APIError("BAD_REQUEST", { code: CONTRASENA_FILTRADA, message: "Esa contraseña aparece en filtraciones de otros sitios. Elegí otra." });
  }
}
