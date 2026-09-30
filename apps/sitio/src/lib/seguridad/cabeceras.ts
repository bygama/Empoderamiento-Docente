/**
 * Las cabeceras de seguridad: las de todo el sitio y las que solo lleva el
 * admin. Las pone el proxy en cada respuesta (`proxy.ts`).
 */

/** Un nonce por respuesta: 16 bytes al azar, en base64. */
export function nuevoNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
}

/**
 * La política de contenido. Dos, según la rama:
 *
 * - **El admin, con nonce y `'strict-dynamic'`:** solo corre el script que
 *   lleva el nonce de esta respuesta (Next se lo pone a los suyos) y lo que
 *   ese script cargue. Un script inyectado no tiene cómo adivinarlo. Pide
 *   renderizar dinámico, y el admin ya lo es.
 * - **El sitio, con `'unsafe-inline'`, y es una concesión.** Un nonce distinto
 *   en cada respuesta obliga a renderizar dinámico, y el sitio público es
 *   estático a propósito —es lo que le da el LCP—. El sitio no renderiza
 *   input de nadie ni carga scripts de otro origen: su superficie de XSS es
 *   mínima y acá la CSP es defensa en profundidad. El de la analítica
 *   también es del mismo origen (`/_vercel/insights/` en Vercel, `/umami/` en
 *   el VPS, que sirve el proxy), así que pasa con `'self'` sin abrir nada:
 *   ADR-0018.
 *
 * `'unsafe-eval'` solo en `next dev`: React lo usa para rearmar las pilas de
 * los errores; en producción nunca.
 *
 * Las imágenes de otro origen, solo las del Blob del sitio (`hostDeFotos`,
 * lib/contenido/host-del-blob.ts), y ninguna si las fotos van a disco.
 */
export function politicaDeContenido({ nonce, desarrollo, hostDeFotos }: { nonce: string | null; desarrollo: boolean; hostDeFotos: string | null }): string {
  const eval_ = desarrollo ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    nonce ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${eval_}` : `script-src 'self' 'unsafe-inline'${eval_}`,
    // Los estilos siguen abiertos: Next y los componentes ponen `style` en
    // línea, y un estilo inyectado no ejecuta nada.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${hostDeFotos ? ` https://${hostDeFotos}` : ""}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Nadie nos mete en un iframe. En el admin eso es lo que frena un
    // clickjacking sobre los botones de publicar y borrar.
    "frame-ancestors 'none'",
    ...(nonce ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function ponerCabeceras(cabeceras: Headers, { csp, esAdmin }: { csp: string; esAdmin: boolean }): void {
  cabeceras.set("Content-Security-Policy", csp);
  // Dos años y subdominios: el valor que pide la lista de precarga de HSTS.
  cabeceras.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  cabeceras.set("X-Content-Type-Options", "nosniff");
  // Se manda el origen a otros sitios, nunca la ruta: una URL del admin no
  // tiene por qué viajar en el Referer.
  cabeceras.set("Referrer-Policy", "strict-origin-when-cross-origin");
  cabeceras.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  if (!esAdmin) return;

  // `robots.txt` es un pedido, no una regla: esto es la negativa de verdad, y
  // viaja en la respuesta aunque alguien llegue por un link directo.
  cabeceras.set("X-Robots-Tag", "noindex, nofollow");
  // Nada del admin se guarda en ningún cache, ni intermedio ni del navegador:
  // cada respuesta es de una sesión (`private`). Pisa la de la ruta —también
  // con `next start`—, así que esta es la que viaja, incluida la descarga de
  // un CV (work/mensajes/, ADR-0012).
  cabeceras.set("Cache-Control", "private, no-store, max-age=0");
  // Una ventana que el admin abre, o que abre al admin, no se pueden tocar
  // (`window.opener`), y nada del admin se carga desde otro sitio.
  cabeceras.set("Cross-Origin-Opener-Policy", "same-origin");
  cabeceras.set("Cross-Origin-Resource-Policy", "same-origin");
  // Lo mismo que `frame-ancestors 'none'`, para los navegadores que no leen CSP.
  cabeceras.set("X-Frame-Options", "DENY");
}
