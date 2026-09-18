import { crearAuth } from "@ed/auth";
import { base } from "./cliente";
import { siteConfig } from "@/config/site";

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

export const auth = crearAuth({
  base,
  secreto: process.env.BETTER_AUTH_SECRET ?? "",
  urlDelSitio: urlDelSitio(),
  // Sin clave de Resend el correo sale por la consola del servidor, que es lo
  // que hace falta en local. El envío de verdad llega con la pantalla de
  // «olvidé mi contraseña» (paso 8 del PLAN).
  mandarResetDeContrasena: async ({ para, nombre, enlace }) => {
    console.info(
      `[${siteConfig.shortName}] Correo de contraseña nueva para ${nombre ?? para} <${para}>:\n  ${enlace}`,
    );
  },
});
