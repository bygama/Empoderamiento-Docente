import { lookup as buscarEnDns } from "node:dns/promises";
import { isIP, type LookupFunction } from "node:net";
import { ipQueNoSePide } from "./ip";

// A dónde se puede pedir algo que eligió una persona, y cómo se resuelve su
// nombre sin que un DNS lo desvíe a la red interna (SPEC §11 de
// `work/biblioteca/`, ADR-0016). Sin ED.

export type Direccion = { address: string; family: number };
/** Cómo se resuelve un nombre: todas sus direcciones. Se inyecta en los tests. */
export type Resolver = (host: string) => Promise<Direccion[]>;

export const resolverDelSistema: Resolver = (host) => buscarEnDns(host, { all: true });

/** Un destino que no se pide, dicho en llano; `codigo` es para quien llama. */
export class DestinoNoPermitido extends Error {
  constructor(
    readonly codigo: "url" | "ip" | "dns",
    mensaje: string,
  ) {
    super(mensaje);
  }
}

/** El host sin los corchetes de una IPv6 literal. */
export const hostDe = (url: URL) => url.hostname.replace(/^\[|\]$/g, "");

/**
 * La URL, si es una a la que se puede pedir: solo `https:`, en el puerto de
 * siempre (443), sin usuario ni contraseña. Un host que es una IP se chequea
 * acá: la conexión a una IP no pasa por el `lookup`.
 */
export function urlPermitida(texto: string | URL): URL {
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    throw new DestinoNoPermitido("url", "No es un link.");
  }
  if (url.protocol !== "https:") throw new DestinoNoPermitido("url", "Solo se leen links que empiezan con https://.");
  if (url.username || url.password) throw new DestinoNoPermitido("url", "El link no puede llevar usuario ni contraseña.");
  if (url.port && url.port !== "443") throw new DestinoNoPermitido("url", "Solo se leen links del puerto de siempre.");
  const host = hostDe(url);
  if (!host) throw new DestinoNoPermitido("url", "El link no tiene sitio.");
  if (isIP(host) && ipQueNoSePide(host)) throw new DestinoNoPermitido("ip", "Ese link apunta a una dirección interna.");
  return url;
}

/** Las direcciones de un host, si todas se pueden pedir. Una sola que no, y no se pide nada. */
export async function direccionesPermitidas(host: string, resolver: Resolver): Promise<Direccion[]> {
  let direcciones: Direccion[];
  try {
    direcciones = await resolver(host);
  } catch {
    throw new DestinoNoPermitido("dns", "Ese sitio no existe: su nombre no lleva a ninguna dirección.");
  }
  if (direcciones.length === 0) throw new DestinoNoPermitido("dns", "Ese sitio no existe: su nombre no lleva a ninguna dirección.");
  if (direcciones.some((d) => ipQueNoSePide(d.address))) throw new DestinoNoPermitido("ip", "Ese link apunta a una dirección interna.");
  return direcciones;
}

/**
 * El `lookup` de la conexión: resuelve, chequea cada dirección y le da a la
 * conexión **solo las chequeadas**. Así la IP con la que se conecta es la
 * que se miró, y un DNS que cambia de respuesta entre el chequeo y la
 * conexión no cuela nada. Contesta en las dos formas que pide Node: una
 * dirección, o todas (`all`, con la conexión que prueba IPv4 e IPv6).
 */
export function lookupProtegido(resolver: Resolver): LookupFunction {
  return (host, opciones, responder) => {
    direccionesPermitidas(host, resolver).then(
      (direcciones) => {
        // El `as`: el tipo de Node junta las dos firmas del callback en una.
        const cb = responder as (e: Error | null, d: string | Direccion[], f?: number) => void;
        if (opciones.all) cb(null, direcciones);
        else cb(null, direcciones[0].address, direcciones[0].family);
      },
      (e: Error) => responder(e, "", 0),
    );
  };
}
