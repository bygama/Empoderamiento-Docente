import { after } from "next/server";
import { crearAuth } from "@ed/auth/servidor";
import { almacenDeBloqueos } from "./bloqueos-de-acceso";
import { base } from "./cliente";
import { elegiTuContrasena } from "@/correos/elegi-tu-contrasena";
import { mandarCorreo } from "@/correos/mandar";
import { tuContrasenaCambio } from "@/correos/tu-contrasena-cambio";

/**
 * La sesión del admin, ya armada con la base de esta app.
 *
 * `@ed/auth` trae la configuración —qué se permite, cuánto dura, qué campos
 * tiene una cuenta— y nada de ED. Lo de ED se junta acá: el cliente de Prisma,
 * la URL del sitio y cómo sale un correo.
 */

function urlDelSitio(): string {
  const cruda =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";
  // Los links de los correos se arman pegando rutas: con barra final quedarían
  // con doble barra.
  return cruda.replace(/\/+$/, "");
}

/**
 * `after()` de Next: la tarea sigue después de contestar y la función de
 * Vercel no se apaga hasta que termine. Fuera de un request (los scripts de
 * `scripts/`) `after` tira; la promesa ya está corriendo y termina igual.
 */
function segundoPlano(tarea: Promise<unknown>): void {
  try {
    after(tarea);
  } catch {
    // Sin request no hay a quién esperar.
  }
}

const url = urlDelSitio();

export const auth = crearAuth({
  base,
  secreto: process.env.BETTER_AUTH_SECRET ?? "",
  urlDelSitio: url,
  bloqueos: almacenDeBloqueos,
  segundoPlano,
  mandarResetDeContrasena: ({ para, nombre, enlace, minutosDeVigencia }) =>
    mandarCorreo({ para, contenido: elegiTuContrasena({ nombre, enlace, minutosDeVigencia }) }),
  avisarCambioDeContrasena: ({ para, nombre }) =>
    mandarCorreo({ para, contenido: tuContrasenaCambio({ nombre, olvideMiContrasena: `${url}/admin/olvide-mi-contrasena` }) }),
});
