import { NextResponse, type NextRequest } from "next/server";
import { hayCookieDeSesion } from "@ed/auth";

/**
 * Las cabeceras de seguridad de todo el sitio, y las que solo valen para el
 * admin.
 *
 * Va en el middleware y no en `headers()` de `next.config.ts` porque el admin
 * necesita las suyas propias y porque acá mismo se monta, en el paso siguiente,
 * la guarda de sesión: una sola pasada por request.
 */

const ADMIN = "/admin";
const ENTRAR = "/admin/entrar";

/** Las del admin que se ven SIN sesión: si no, no habría por dónde entrar. */
const ABIERTAS = [ENTRAR, "/admin/olvide-mi-contrasena", "/admin/nueva-contrasena"];

/**
 * La política de contenido.
 *
 * **`'unsafe-inline'` en `script-src` es una concesión y conviene saber por
 * qué.** Lo estricto sería un nonce por respuesta, pero un nonce distinto en
 * cada request obliga a renderizar dinámico, y el sitio público es estático a
 * propósito —es lo que le da el LCP—. La cuenta que se hace: el sitio no
 * renderiza input de nadie ni carga scripts de terceros, así que su superficie
 * de XSS es mínima y acá la CSP es defensa en profundidad.
 *
 * El día que el admin tenga pantallas propias (que son dinámicas), ahí sí vale
 * un nonce, y esta función ya está partida para poder dárselo solo a esa rama.
 */
function politicaDeContenido(esAdmin: boolean): string {
  return [
    "default-src 'self'",
    // React usa eval() en desarrollo para rearmar las pilas de llamadas de los
    // errores; en producción nunca. Solo se abre en `next dev`.
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Nadie nos mete en un iframe. En el admin eso es lo que frena un
    // clickjacking sobre los botones de publicar y borrar.
    "frame-ancestors 'none'",
    ...(esAdmin ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/**
 * Adónde mandar a quien no tiene sesión. El `volver` es **solo la ruta**: con
 * una URL completa esto sería un redirect abierto de manual.
 */
function aEntrar(req: NextRequest, ruta: string): URL {
  const destino = req.nextUrl.clone();
  destino.pathname = ENTRAR;
  destino.search = ruta === ADMIN ? "" : `?volver=${encodeURIComponent(ruta)}`;
  return destino;
}

export function middleware(req: NextRequest) {
  const ruta = req.nextUrl.pathname;
  const esAdmin = ruta.startsWith(ADMIN);

  // Del admin sin sesión no sale ni una página a medio renderizar: se corta
  // acá y se redirige. Es un filtro optimista —Edge no puede consultar la
  // base—; la comprobación de verdad la hace el layout del admin.
  const cerrada =
    esAdmin && !ABIERTAS.some((a) => ruta === a || ruta.startsWith(`${a}/`));
  // Una Server Action sin cookie no se redirige: un redirect no es una
  // respuesta válida para una acción y el cliente se rompe con «unexpected
  // response». La acción verifica la sesión ella misma —toda acción del admin
  // lo hace, porque el layout no las cubre— y contesta en llano.
  const esAccion = req.headers.has("next-action");
  const res =
    cerrada && !esAccion && !hayCookieDeSesion(req) ? NextResponse.redirect(aEntrar(req, ruta)) : NextResponse.next();

  res.headers.set("Content-Security-Policy", politicaDeContenido(esAdmin));
  // Dos años y subdominios: el valor que pide la lista de precarga de HSTS.
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Se manda el origen a otros sitios, nunca la ruta: una URL del admin no
  // tiene por qué viajar en el Referer.
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );

  if (esAdmin) {
    // `robots.txt` es una pedido, no una regla: esto es la negativa de verdad,
    // y viaja en la respuesta aunque alguien llegue por un link directo.
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    // Una página del admin no se guarda en ningún cache intermedio.
    res.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return res;
}

export const config = {
  // Todo menos los assets y el favicon: ponerle cabeceras a cada chunk de JS
  // no aporta nada y se paga en cada request. `_vercel` es el script y los
  // envíos de la analítica (`/_vercel/insights/…`): pasarlos por el
  // middleware gastaba una invocación por vista y no aportaba nada.
  matcher: ["/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|woff2)$).*)"],
};
