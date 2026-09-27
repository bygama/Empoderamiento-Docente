import { createHmac } from "node:crypto";

// El tope de envíos por IP de un formulario público. Acá se arma la clave;
// dónde se cuenta lo decide la app (`datos/limites-por-ip.ts`). No sabe de ED.

/**
 * La IP de quien manda: la primera de `x-forwarded-for`, o `x-real-ip`, las
 * mismas que lee better-auth; sin ninguna (en local), todas comparten un cupo.
 * Confiar en ellas es seguro solo porque las pone el proxy de delante y el
 * cliente no las puede elegir: en Vercel, su borde; en el VPS, Caddy, que
 * descarta las que manda el cliente y es lo único que le habla a la app
 * (deploy/Caddyfile, ADR-0018).
 */
export function ipDelPedido(cabeceras: Headers): string {
  const reenviada = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim();
  return reenviada || cabeceras.get("x-real-ip")?.trim() || "desconocida";
}

/**
 * Con qué se guarda una IP: su HMAC, nunca la IP. El prefijo separa este uso
 * del mismo secreto de los otros, y el formulario, un cupo del otro.
 */
export function claveDeLimite(formulario: string, ip: string, secreto: string): string {
  return createHmac("sha256", secreto).update(`limites-por-ip:${formulario}:${ip}`).digest("hex");
}
