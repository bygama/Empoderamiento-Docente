/**
 * El rebote de las cookies `SameSite=Strict`.
 *
 * Una cookie `Strict` no viaja en una navegación que empieza en otro sitio,
 * ni siquiera en un link: quien abre el admin desde un correo o un chat llega
 * sin su cookie de sesión aunque la tenga. En vez de mandarla a «entrar», se
 * le contesta una página mínima que vuelve a pedir la misma URL. Esa segunda
 * navegación la empieza esta misma página, así que ya es del mismo origen y
 * lleva la cookie; si no hay sesión, ahí sí va a «entrar».
 *
 * Sin JS: un `<meta http-equiv="refresh">`, que la CSP no frena porque no es
 * script, y un link «Seguir» para quien tenga el refresh apagado.
 *
 * **La contracara: un GET del admin no puede cambiar nada.** El rebote
 * convierte cualquier link de otro sitio en un GET con la sesión puesta, así
 * que `SameSite=Strict` protege solo lo que no se hace con un GET. Todo lo
 * que escribe va por una Server Action o por la API de better-auth, que son
 * POST y no rebotan; las páginas y las rutas del admin (`route.ts`) solo
 * leen, por `datos/consultas/`. Lo único que un GET toca es la renovación de
 * la propia sesión, que hace better-auth. `proxy.test.ts` lo vigila.
 */

/**
 * ¿Es una navegación de documento que empezó en otro sitio? Las tres
 * cabeceras `Sec-Fetch-*` las pone el navegador y una página no las puede
 * falsificar. Un `POST` nunca rebota (las Server Actions siguen su camino), ni
 * lo que el navegador marca `none` (una URL tipeada o un favorito, que ya
 * llevan la cookie) o `same-origin`.
 */
export function esLlegadaDeOtroSitio(req: Request): boolean {
  const h = req.headers;
  return (
    req.method === "GET" &&
    h.get("sec-fetch-site") === "cross-site" &&
    h.get("sec-fetch-mode") === "navigate" &&
    h.get("sec-fetch-dest") === "document"
  );
}

function escapar(valor: string): string {
  return valor.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * La página del rebote. El destino es **relativo y sale del propio pedido**
 * —su ruta y su query—, nunca de un parámetro ni de una cabecera: así no hay
 * forma de usarla para mandar a nadie a otro sitio. Las barras del principio
 * se reducen a una para que `//otro.sitio` no se lea como un dominio.
 */
export function paginaDeRebote(url: URL): Response {
  const destino = escapar(`/${url.pathname.replace(/^\/+/, "")}${url.search}`);
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${destino}"><title>Un momento…</title></head>
<body><p><a href="${destino}">Seguir</a></p></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
