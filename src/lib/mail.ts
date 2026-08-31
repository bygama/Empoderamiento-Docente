// Envío de correo por SMTP.
//
// Usamos el SMTP de Hostinger, que ya está pagado con el dominio y las
// casillas (ver docs/features/contacto.md). No sumamos un servicio de
// mail aparte porque no hace falta: el correo sale desde el propio
// dominio de ED, que además ya tiene el SPF puesto, así que llega bien
// a destino en vez de caer en spam.

import nodemailer from "nodemailer";

type Config = {
  host: string;
  port: number;
  user: string;
  pass: string;
  destino: string;
};

/**
 * Lee la configuración de SMTP del entorno.
 *
 * Devuelve null si falta algo, en vez de explotar: así el endpoint puede
 * responder un error prolijo y el sitio sigue funcionando aunque las
 * credenciales no estén cargadas todavía.
 */
function leerConfig(): Config | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    user,
    pass,
    // Si no se define un destino aparte, las consultas van a la misma
    // casilla que las manda.
    destino: process.env.CONTACTO_DESTINO ?? user,
  };
}

// El transporte se arma una sola vez por instancia. En serverless las
// instancias se reusan entre pedidos seguidos, así que esto evita abrir
// una conexión SMTP nueva en cada consulta.
let transporteCache: nodemailer.Transporter | null = null;

function obtenerTransporte(config: Config) {
  if (!transporteCache) {
    transporteCache = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      // El 465 va con SSL directo; cualquier otro puerto (587) negocia
      // STARTTLS.
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
  }
  return transporteCache;
}

export type MailConsulta = {
  nombre: string;
  email: string;
  institucion?: string;
  pais?: string;
  mensaje: string;
  tema?: string;
};

export type ResultadoEnvio =
  | { ok: true }
  | { ok: false; motivo: "sin-configurar" | "fallo-envio" };

/**
 * Manda una consulta del formulario a la casilla de ED.
 */
export async function enviarConsulta(consulta: MailConsulta): Promise<ResultadoEnvio> {
  const config = leerConfig();
  if (!config) return { ok: false, motivo: "sin-configurar" };

  const asunto = `[Web] ${consulta.tema || "Consulta"} — ${consulta.nombre}`;

  // Los datos de contacto van al final, separados del mensaje, para que
  // quien lee en la casilla encuentre primero lo que la persona quiso
  // decir y no los metadatos.
  const cuerpo = [
    consulta.mensaje,
    "",
    "—",
    `Nombre: ${consulta.nombre}`,
    `Email: ${consulta.email}`,
    consulta.institucion ? `Institución: ${consulta.institucion}` : null,
    consulta.pais ? `País: ${consulta.pais}` : null,
    consulta.tema ? `Tema: ${consulta.tema}` : null,
  ]
    .filter((linea) => linea !== null)
    .join("\n");

  try {
    await obtenerTransporte(config).sendMail({
      // El remitente tiene que ser la casilla autenticada: si ponemos el
      // correo de quien escribe, el servidor lo rechaza por SPF.
      from: `"Web Empoderamiento Docente" <${config.user}>`,
      to: config.destino,
      // Con esto, "Responder" en el cliente de correo le contesta
      // directo a la persona, sin copiar y pegar la dirección.
      replyTo: `"${consulta.nombre}" <${consulta.email}>`,
      subject: asunto,
      text: cuerpo,
    });
    return { ok: true };
  } catch {
    // El detalle del error no sale de acá: puede traer datos de la
    // conexión SMTP y termina en los logs de Vercel.
    return { ok: false, motivo: "fallo-envio" };
  }
}
