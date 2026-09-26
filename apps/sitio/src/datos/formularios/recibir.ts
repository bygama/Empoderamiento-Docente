import { siteConfig } from "@/config/site";
import type { Bandeja } from "@/config/mensajes";
import { claveDeLimite, ipDelPedido } from "@/lib/formularios/limite";
import { sumarEnvio } from "@/datos/limites-por-ip";

// Lo común a los formularios públicos (`/api/contacto`, `/api/cv`): la forma
// de la respuesta, el tope por IP y los errores en llano. La respuesta es la
// que espera la coreografía de envío del sitio: `{ ok: true }` sigue al
// cierre, `{ ok: false, error }` se queda en el formulario y lo muestra.

export type Respuesta = { ok: true } | { ok: false; error: string };

export const ESCRIBINOS = `escribinos a ${siteConfig.contacto.email}`;

const HORA_MS = 60 * 60 * 1000;

function responder(estado: number, cuerpo: Respuesta, cabeceras: Record<string, string> = {}): Response {
  return Response.json(cuerpo, { status: estado, headers: { "Cache-Control": "no-store", ...cabeceras } });
}

export function recibido(): Response {
  return responder(200, { ok: true });
}

export function rechazado(estado: number, error: string): Response {
  return responder(estado, { ok: false, error });
}

export function demasiados(): Response {
  return responder(429, { ok: false, error: `Ya nos mandaste varios seguidos. Probá de nuevo en una hora, o ${ESCRIBINOS}.` }, {
    "Retry-After": String(HORA_MS / 1000),
  });
}

export function noSePudo(): Response {
  return rechazado(500, `No pudimos guardar lo que mandaste. Probá de nuevo en un rato, o ${ESCRIBINOS}.`);
}

/**
 * Suma este envío al cupo de su IP en ese formulario y dice si todavía entra.
 * Cuenta también los que el tope rechaza: insistir no abre el cupo antes.
 */
export async function dentroDelTope(formulario: Bandeja, pedido: Request, tope: number): Promise<boolean> {
  const clave = claveDeLimite(formulario, ipDelPedido(pedido.headers), process.env.BETTER_AUTH_SECRET ?? "");
  return (await sumarEnvio(clave, HORA_MS)) <= tope;
}

/**
 * Qué falló, **sin nada de lo que llegó**: el mensaje de un error de Prisma
 * puede traer los valores que se intentaron guardar, y un log de producción
 * no es lugar para el correo o el CV de nadie.
 */
export function motivoSinDatos(e: unknown): string {
  if (!(e instanceof Error)) return "error desconocido";
  const codigo = (e as { code?: unknown }).code;
  return typeof codigo === "string" ? `${e.name} ${codigo}` : e.name;
}

/** Lo que pesa el cuerpo según quien lo manda, o 0 si no lo dice. */
export function largoDelPedido(pedido: Request): number {
  return Number(pedido.headers.get("content-length")) || 0;
}
