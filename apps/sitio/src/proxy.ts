import { NextResponse, type NextRequest } from "next/server";
import { hayCookieDeSesion } from "@ed/auth";
import { hostDelBlob } from "@/lib/contenido/host-del-blob";
import { CABECERA_DEL_METODO } from "@/lib/metricas/clic";
import { nuevoNonce, politicaDeContenido, ponerCabeceras } from "@/lib/seguridad/cabeceras";
import { esLlegadaDeOtroSitio, paginaDeRebote } from "@/lib/seguridad/rebote";

/**
 * La guarda de sesión del admin y las cabeceras de seguridad de todo el
 * sitio (lib/seguridad/cabeceras.ts).
 *
 * Va en el proxy (el que en Next 15 se llamaba `middleware.ts`) y no en
 * `headers()` de `next.config.ts` porque el admin necesita las suyas propias
 * —con un nonce distinto en cada respuesta— y porque acá mismo se monta la
 * guarda de sesión: una sola pasada por request.
 */

const ADMIN = "/admin";
const ENTRAR = "/admin/entrar";

/** Las del admin que se ven SIN sesión: si no, no habría por dónde entrar. */
const ABIERTAS = [ENTRAR, "/admin/olvide-mi-contrasena", "/admin/nueva-contrasena"];

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

/**
 * Lo que viaja hacia adentro del pedido. El admin lleva su CSP (Next saca el
 * nonce de ahí). Un link corto (`/l/`) lleva el método real en
 * `CABECERA_DEL_METODO`, **siempre pisada**: su página no ve el método y un
 * HEAD no es un clic (lib/metricas/clic.ts). Lo demás pasa como vino.
 */
function haciaAdentro(req: NextRequest, esAdmin: boolean, csp: string): { request: { headers: Headers } } | undefined {
  if (esAdmin) return { request: { headers: conCabecera(req.headers, "Content-Security-Policy", csp) } };
  if (req.nextUrl.pathname.startsWith("/l/")) return { request: { headers: conCabecera(req.headers, CABECERA_DEL_METODO, req.method) } };
  return undefined;
}

function conCabecera(cabeceras: Headers, nombre: string, valor: string): Headers {
  const copia = new Headers(cabeceras);
  copia.set(nombre, valor);
  return copia;
}

export function proxy(req: NextRequest) {
  const ruta = req.nextUrl.pathname;
  const esAdmin = ruta.startsWith(ADMIN);

  // Del admin sin sesión no sale ni una página a medio renderizar: se corta
  // acá y se redirige. Es un filtro optimista —solo mira que la cookie
  // esté, sin ir a la base—; la comprobación de verdad la hace el layout.
  const cerrada =
    esAdmin && !ABIERTAS.some((a) => ruta === a || ruta.startsWith(`${a}/`));
  // Una Server Action sin cookie no se redirige: un redirect no es una
  // respuesta válida para una acción y el cliente se rompe con «unexpected
  // response». La acción verifica la sesión ella misma —toda acción del admin
  // lo hace, porque el layout no las cubre— y contesta en llano.
  const esAccion = req.headers.has("next-action");
  const sinSesion = cerrada && !esAccion && !hayCookieDeSesion(req);
  const csp = politicaDeContenido({
    nonce: esAdmin ? nuevoNonce() : null,
    desarrollo: process.env.NODE_ENV === "development",
    hostDeFotos: hostDelBlob(process.env.BLOB_READ_WRITE_TOKEN),
  });
  // Sin cookie puede ser que no haya sesión, o que la cookie (`Strict`) no
  // haya viajado porque el link estaba en otro sitio: esa navegación se
  // rebota a la misma URL antes de mandarla a «entrar» (lib/seguridad/rebote.ts).
  const res = !sinSesion
    ? // Next saca el nonce de la CSP del *pedido* y se lo pone a sus scripts:
      // por eso la política viaja también hacia adentro, no solo en la respuesta.
      NextResponse.next(haciaAdentro(req, esAdmin, csp))
    : esLlegadaDeOtroSitio(req)
      ? paginaDeRebote(req.nextUrl)
      : NextResponse.redirect(aEntrar(req, ruta));

  ponerCabeceras(res.headers, { csp, esAdmin });
  return res;
}

export const config = {
  // Todo menos los assets y el favicon: ponerle cabeceras a cada chunk de JS
  // no aporta nada y se paga en cada request. `_vercel` es el script y los
  // envíos de la analítica (`/_vercel/insights/…`): pasarlos por el
  // proxy gastaba una invocación por vista y no aportaba nada.
  matcher: ["/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|woff2)$).*)"],
};
