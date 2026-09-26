import { createPrivateKey, sign, type KeyObject } from "node:crypto";
import { ErrorDeBusquedas } from "./tipos";

// El permiso de una cuenta de servicio de Google, sin dependencias: un JWT
// RS256 firmado con node:crypto y canjeado por un access token. La forma sale
// de «Using OAuth 2.0 for Server to Server Applications» (verificada el
// 2026-09-26).

const URL_DEL_TOKEN = "https://oauth2.googleapis.com/token";
export const ALCANCE_DE_LECTURA = "https://www.googleapis.com/auth/webmasters.readonly";
export const TIEMPO_MAXIMO_MS = 20_000;

/** Google acepta hasta una hora. */
const VIGENCIA_S = 3600;

const base64url = (datos: string) => Buffer.from(datos).toString("base64url");

/** La clave del JSON de la cuenta de servicio. Acepta los `\n` escritos, como quedan al pegarla en una variable. */
function leerClave(clave: string): KeyObject {
  try {
    return createPrivateKey(clave.replace(/\\n/g, "\n"));
  } catch {
    throw new ErrorDeBusquedas(0, "La clave privada de la cuenta de servicio no se pudo leer: tiene que estar entera, desde «-----BEGIN PRIVATE KEY-----».");
  }
}

export function firmarJwt({ correo, clave, alcance, ahora }: { correo: string; clave: string; alcance: string; ahora: number }): string {
  const iat = Math.floor(ahora / 1000);
  const encabezado = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const reclamos = base64url(JSON.stringify({ iss: correo, scope: alcance, aud: URL_DEL_TOKEN, iat, exp: iat + VIGENCIA_S }));
  const firmado = `${encabezado}.${reclamos}`;
  const firma = sign("sha256", Buffer.from(firmado), leerClave(clave)).toString("base64url");
  return `${firmado}.${firma}`;
}

function explicar(estado: number, error: unknown): string {
  if (error === "invalid_grant") {
    return "Google no aceptó la cuenta de servicio (invalid_grant): la clave no es de ese correo, se borró, o el reloj del servidor está corrido.";
  }
  return `Google no dio el permiso de acceso (${estado}${typeof error === "string" ? `, ${error}` : ""}).`;
}

export async function pedirToken({
  correo,
  clave,
  alcance,
  ahora,
  fetchImpl,
}: {
  correo: string;
  clave: string;
  alcance: string;
  ahora: number;
  fetchImpl: typeof fetch;
}): Promise<string> {
  const cuerpo = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: firmarJwt({ correo, clave, alcance, ahora }),
  });
  const res = await fetchImpl(URL_DEL_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo,
    signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
  });
  const respuesta = (await res.json().catch(() => ({}))) as { access_token?: unknown; error?: unknown };
  if (!res.ok || typeof respuesta.access_token !== "string") throw new ErrorDeBusquedas(res.status, explicar(res.status, respuesta.error));
  return respuesta.access_token;
}
