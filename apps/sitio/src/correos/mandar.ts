import { randomUUID } from "node:crypto";
import { crearClienteDeResend } from "@/lib/correo/resend";
import type { Contenido } from "./plantilla";

/**
 * Por dónde sale un correo, elegido por el entorno en un solo lugar:
 *
 * - con `RESEND_API_KEY`, por Resend, desde `CORREO_REMITENTE`;
 * - sin clave y fuera de producción, por la consola, entero: en local es lo
 *   que hace falta para seguir el enlace;
 * - sin clave en producción, un error que dice que no salió, **sin el enlace
 *   ni el destinatario**. Los logs de producción los lee más gente que el
 *   buzón, y un enlace de contraseña en un log es una cuenta regalada.
 */
export async function mandarCorreo(
  { para, contenido }: { para: string; contenido: Contenido },
  { entorno = process.env, fetchImpl }: { entorno?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch } = {},
): Promise<void> {
  const clave = entorno.RESEND_API_KEY;
  if (clave) {
    const de = entorno.CORREO_REMITENTE;
    if (!de) throw new Error("Falta CORREO_REMITENTE: con RESEND_API_KEY hace falta desde qué dirección sale el correo.");
    // Una clave por correo: si el primer intento llegó pero la respuesta se
    // perdió, el reintento del cliente no lo manda dos veces.
    await crearClienteDeResend({ clave, fetchImpl }).mandar({ de, para, ...contenido, idempotencia: randomUUID() });
    return;
  }
  if (entorno.NODE_ENV === "production") {
    console.error(`[correo] «${contenido.asunto}» no salió: falta RESEND_API_KEY.`);
    return;
  }
  console.info(`[correo] Para ${para} — ${contenido.asunto}\n\n${contenido.texto}\n`);
}
