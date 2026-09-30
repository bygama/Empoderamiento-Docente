import { createHmac } from "node:crypto";
import { isIP } from "node:net";

// El tope de envíos por IP de un formulario público. Acá se arma la clave;
// dónde se cuenta lo decide la app (`datos/limites-por-ip.ts`). No sabe de ED.

const DESCONOCIDA = "desconocida";

/**
 * La IP de quien manda, lista para ser la clave de un cupo. Sale **solo de
 * `x-real-ip`**, la misma que lee better-auth (`@ed/auth`, config.ts): el
 * proxy de delante la pisa siempre con la IP de la conexión —en Vercel, su
 * borde; en el VPS, Caddy, que es lo único que le habla a la app
 * (ADR-0018)—, así que el cliente no la elige. `x-forwarded-for` no se lee:
 * según quién esté delante puede traer, a la izquierda, lo que escribió el
 * cliente.
 *
 * Sin una IP válida (en local no hay proxy), todas comparten un cupo. Una
 * IPv6 cuenta por su /64, que es lo que suele recibir una sola conexión:
 * cambiar de dirección adentro de ella no da un cupo nuevo.
 */
export function ipDelPedido(cabeceras: Headers): string {
  const ip = cabeceras.get("x-real-ip")?.trim() ?? "";
  const version = isIP(ip);
  if (version === 4) return ip;
  if (version === 6) return redDeUnaIPv6(ip) ?? DESCONOCIDA;
  return DESCONOCIDA;
}

/** La forma canónica de una IPv6 (minúsculas, ceros comprimidos), del parser de URL; `null` si no la lee. */
function canonica(ipv6: string): string | null {
  try {
    return new URL(`http://[${ipv6}]/`).hostname.slice(1, -1);
  } catch {
    return null;
  }
}

/** Los ocho grupos de una IPv6 canónica, como números. */
function grupos(ipv6: string): number[] {
  const [izquierda = "", derecha = ""] = ipv6.split("::");
  const leer = (parte: string) => (parte ? parte.split(":").map((g) => parseInt(g, 16)) : []);
  const [antes, despues] = [leer(izquierda), leer(derecha)];
  return ipv6.includes("::") ? [...antes, ...Array<number>(8 - antes.length - despues.length).fill(0), ...despues] : antes;
}

/** Su /64 («2001:db8:abcd:12::/64»), o la IPv4 si es una IPv4 escrita como IPv6 (`::ffff:a.b.c.d`). */
function redDeUnaIPv6(ip: string): string | null {
  const forma = canonica(ip);
  if (forma === null) return null;
  const g = grupos(forma);
  const [, , , , , marca = -1, alto = 0, bajo = 0] = g;
  if (g.slice(0, 5).every((x) => x === 0) && marca === 0xffff) return [alto >> 8, alto & 255, bajo >> 8, bajo & 255].join(".");
  const red = canonica(`${g.slice(0, 4).map((x) => x.toString(16)).join(":")}::`);
  return red === null ? null : `${red}/64`;
}

/**
 * Con qué se guarda una IP: su HMAC, nunca la IP. El prefijo separa este uso
 * del mismo secreto de los otros, y el formulario, un cupo del otro.
 */
export function claveDeLimite(formulario: string, ip: string, secreto: string): string {
  return createHmac("sha256", secreto).update(`limites-por-ip:${formulario}:${ip}`).digest("hex");
}
