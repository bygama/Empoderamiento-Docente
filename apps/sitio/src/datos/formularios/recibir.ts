import type { Bandeja } from "@/config/mensajes";
import type { Respuesta } from "@/lib/formularios/enviar";
import { claveDeLimite, ipDelPedido } from "@/lib/formularios/limite";
import { segundoPlano } from "@/lib/segundo-plano";
import { avisarMensajeNuevo } from "@/datos/avisos";
import { sumarEnvio } from "@/datos/limites-por-ip";

// Lo común a los formularios públicos (`/api/contacto`, `/api/cv`): la forma
// de la respuesta, el tope por IP y los errores en llano. La respuesta es la
// que espera la coreografía de envío del sitio: `{ ok: true }` sigue al
// cierre, `{ ok: false, error }` se queda en el formulario y lo muestra
// (`lib/formularios/enviar.ts`, del lado del navegador).

/** La salida de todo error: el correo de ED, el de Ajustes › Datos del sitio (`datosDelSitio().correo`). */
export const escribinosA = (correo: string) => `escribinos a ${correo}`;

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

export function demasiados(correo: string): Response {
  return responder(429, { ok: false, error: `Ya nos mandaste varios seguidos. Probá de nuevo en una hora, o ${escribinosA(correo)}.` }, {
    "Retry-After": String(HORA_MS / 1000),
  });
}

export function noSePudo(correo: string): Response {
  return rechazado(500, `No pudimos guardar lo que mandaste. Probá de nuevo en un rato, o ${escribinosA(correo)}.`);
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

/**
 * Avisa por correo, después de contestar: quien mandó el formulario no espera
 * a Resend, y un aviso que falla no convierte en error un mensaje guardado.
 */
export function avisarDespues(mensaje: { id: string; bandeja: Bandeja }): void {
  segundoPlano(avisarMensajeNuevo(mensaje).catch((e) => console.error("avisarMensajeNuevo:", motivoSinDatos(e))));
}
