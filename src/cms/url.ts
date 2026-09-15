// Dónde vive el sitio: se lo pasa a Payload (serverURL) para armar los links
// de los correos y de la vista previa. Vercel define VERCEL_URL en cada
// preview y VERCEL_PROJECT_PRODUCTION_URL en producción.
export function urlDelSitio(): string {
  return sinBarraFinal(elegirUrl());
}

function elegirUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Los links del correo y de la vista previa se arman pegando rutas: con una
// barra final quedarían con doble barra.
function sinBarraFinal(url: string): string {
  return url.replace(/\/+$/, "");
}
