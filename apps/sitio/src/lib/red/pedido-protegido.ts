import type { IncomingHttpHeaders } from "node:http";
import { request } from "node:https";
import type { LookupFunction } from "node:net";
import { DestinoNoPermitido, lookupProtegido, resolverDelSistema, urlPermitida, type Resolver } from "./destino";

// Pedirle algo a un link que eligió una persona (SPEC §11 de
// `work/biblioteca/`, ADR-0016): solo https, a una IP pública chequeada antes
// de conectar, cada redirección chequeada otra vez, con tope de bytes y de
// tiempo, y sin cookies. Sin dependencias: `node:https` con un `lookup`
// propio. Sin ED.

export type Metodo = "GET" | "HEAD";
export type Respuesta = { estado: number; cabeceras: IncomingHttpHeaders; cuerpo: AsyncIterable<Buffer | string>; cortar: () => void };
/** Un pedido, sin seguir redirecciones. Se inyecta en los tests. */
export type Abrir = (url: URL, o: { metodo: Metodo; lookup: LookupFunction; senal: AbortSignal; cabeceras: Record<string, string> }) => Promise<Respuesta>;

export type Opciones = {
  /** El `User-Agent`: quién pide, con un contacto (Crossref lo pide). */
  agente: string;
  metodo?: Metodo;
  /** Si hay que leer el cuerpo (una página); si no, alcanza el estado. */
  leerCuerpo?: boolean;
  aceptar?: string;
  maximoBytes?: number;
  limiteMs?: number;
  resolver?: Resolver;
  abrir?: Abrir;
};

export type Resultado =
  | { ok: true; estado: number; url: string; tipo: string; cuerpo: string; truncado: boolean }
  | { ok: false; motivo: "url" | "ip" | "dns" | "redirecciones" | "tiempo" | "red"; detalle: string };

const REDIRECCIONES = new Set([301, 302, 303, 307, 308]);
const MAXIMO_REDIRECCIONES = 5;
/** 2 MB: una página entera, con su `<head>`, entra de sobra. */
export const MAXIMO_BYTES = 2 * 1024 * 1024;
/** 8 segundos por pedido, con sus redirecciones. */
export const LIMITE_MS = 8000;

const abrirConHttps: Abrir = (url, { metodo, lookup, senal, cabeceras }) =>
  new Promise((resolver, rechazar) => {
    // `agent: false`: una conexión propia, sin pool ni nada guardado entre pedidos.
    const pedido = request(url, { method: metodo, lookup, signal: senal, headers: cabeceras, agent: false }, (res) =>
      resolver({ estado: res.statusCode ?? 0, cabeceras: res.headers, cuerpo: res, cortar: () => res.destroy() }),
    );
    pedido.on("error", rechazar);
    pedido.end();
  });

/** El cuerpo hasta el tope: pasado, se corta la descarga y se queda con lo leído. */
async function leer(cuerpo: AsyncIterable<Buffer | string>, maximo: number): Promise<{ bytes: Buffer; truncado: boolean }> {
  const partes: Buffer[] = [];
  let total = 0;
  for await (const parte of cuerpo) {
    const b = typeof parte === "string" ? Buffer.from(parte) : parte;
    if (total + b.length > maximo) {
      partes.push(b.subarray(0, maximo - total));
      return { bytes: Buffer.concat(partes), truncado: true };
    }
    partes.push(b);
    total += b.length;
  }
  return { bytes: Buffer.concat(partes), truncado: false };
}

/** El texto en el juego de caracteres que declara la respuesta; si no lo declara o no se conoce, UTF-8. */
function decodificar(bytes: Buffer, tipo: string): string {
  const charset = /charset=["']?([\w-]+)/i.exec(tipo)?.[1] ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

export async function pedirProtegido(destino: string, o: Opciones): Promise<Resultado> {
  const limiteMs = o.limiteMs ?? LIMITE_MS;
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), limiteMs);
  const cabeceras = { "user-agent": o.agente, accept: o.aceptar ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "accept-language": "es,en;q=0.8" };
  const lookup = lookupProtegido(o.resolver ?? resolverDelSistema);
  try {
    let url = urlPermitida(destino);
    let metodo = o.metodo ?? "GET";
    for (let saltos = 0; ; saltos += 1) {
      const r = await (o.abrir ?? abrirConHttps)(url, { metodo, lookup, senal: control.signal, cabeceras });
      const donde = r.cabeceras.location;
      if (REDIRECCIONES.has(r.estado) && typeof donde === "string") {
        r.cortar();
        if (saltos >= MAXIMO_REDIRECCIONES) return { ok: false, motivo: "redirecciones", detalle: "El link da demasiadas vueltas antes de llegar." };
        url = urlPermitida(new URL(donde, url));
        if (r.estado === 303 && metodo !== "HEAD") metodo = "GET";
        continue;
      }
      const tipo = String(r.cabeceras["content-type"] ?? "");
      if (!o.leerCuerpo || metodo === "HEAD") {
        r.cortar();
        return { ok: true, estado: r.estado, url: url.toString(), tipo, cuerpo: "", truncado: false };
      }
      const { bytes, truncado } = await leer(r.cuerpo, o.maximoBytes ?? MAXIMO_BYTES);
      return { ok: true, estado: r.estado, url: url.toString(), tipo, cuerpo: decodificar(bytes, tipo), truncado };
    }
  } catch (e) {
    if (e instanceof DestinoNoPermitido) return { ok: false, motivo: e.codigo, detalle: e.message };
    if (control.signal.aborted) return { ok: false, motivo: "tiempo", detalle: `No contestó en ${Math.round(limiteMs / 1000)} segundos.` };
    return { ok: false, motivo: "red", detalle: "No se pudo conectar con ese sitio." };
  } finally {
    clearTimeout(reloj);
  }
}
