// POST /api/contacto — recibe una consulta del formulario y la manda por
// correo a la casilla de ED.
//
// Antes de esto el formulario abría un `mailto:`, lo que dejaba el envío
// en manos del cliente de correo del visitante. En celulares sin app de
// mail configurada eso significaba perder la consulta sin que nadie se
// enterara (ver docs/features/contacto.md).

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { contactoSchema } from "@/features/contacto/schema";
import { enviarConsulta } from "@/lib/mail";

// nodemailer abre un socket SMTP, así que necesita el runtime de Node.
// En Edge no corre.
export const runtime = "nodejs";

// ── Freno de ráfagas ──────────────────────────────────────────────────────
//
// Cuenta los envíos por IP en memoria. Es un freno parcial a propósito:
// cada instancia de la función tiene su propio contador, así que alguien
// insistente puede saltarlo. Alcanza para cortar el bot que postea mil
// veces seguidas, que es el caso real. Si algún día hace falta algo
// serio, va con un store compartido.

const LIMITE = 5;
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos

const intentos = new Map<string, { cuenta: number; desde: number }>();

function pasaElLimite(ip: string): boolean {
  const ahora = Date.now();
  const previo = intentos.get(ip);

  if (!previo || ahora - previo.desde > VENTANA_MS) {
    intentos.set(ip, { cuenta: 1, desde: ahora });
    return true;
  }

  if (previo.cuenta >= LIMITE) return false;

  previo.cuenta += 1;
  return true;
}

function ipDelPedido(request: Request): string {
  // Detrás del CDN de Vercel la IP real viene en el header; el primero de
  // la lista es el cliente.
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}

// ── Endpoint ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido mal formado." }, { status: 400 });
  }

  const parsed = contactoSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisá los datos del formulario.",
        campos: camposConError(parsed.error),
      },
      { status: 400 },
    );
  }

  const datos = parsed.data;

  // Honeypot lleno: es un bot. Le respondemos que salió todo bien para no
  // avisarle que lo detectamos, pero no mandamos nada.
  if (datos.website) {
    return NextResponse.json({ ok: true });
  }

  if (!pasaElLimite(ipDelPedido(request))) {
    return NextResponse.json(
      { ok: false, error: "Recibimos varias consultas tuyas recién. Probá de nuevo en un rato." },
      { status: 429 },
    );
  }

  const resultado = await enviarConsulta(datos);

  if (!resultado.ok) {
    // Distinguimos los dos casos porque significan cosas distintas para
    // quien mantiene el sitio: uno es "faltan las credenciales", el otro
    // es "el servidor de correo falló".
    const status = resultado.motivo === "sin-configurar" ? 503 : 502;
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar tu consulta.", motivo: resultado.motivo },
      { status },
    );
  }

  return NextResponse.json({ ok: true });
}

/** Aplana los errores de zod a { campo: "primer mensaje" }. */
function camposConError(error: ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "");
    if (campo && !salida[campo]) salida[campo] = issue.message;
  }
  return salida;
}
