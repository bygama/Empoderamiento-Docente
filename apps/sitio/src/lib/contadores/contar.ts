// Del lado del navegador: avisarle al sitio que pasó un evento raro, para que
// lo sume (`POST /api/contar`). **No guarda nada en el navegador** —ni
// cookie, ni `localStorage`, ni `sessionStorage`— y nunca rompe la página:
// si el aviso no sale, se pierde una suma. No sabe de ED.

export type Ubicacion = { href: string; referrer: string };

export type CuerpoDelEvento = { evento: string; clave?: string; referido?: string; enlace?: string };

/**
 * Lo que se manda: el evento y su clave; el host de donde vino la persona,
 * solo si es otro sitio (el propio no dice nada); y el código del link corto,
 * solo si la URL todavía lo trae (`utm_medium=link`). Pura, para probarla.
 */
export function cuerpoDelEvento(evento: string, { href, referrer }: Ubicacion, clave?: string): CuerpoDelEvento {
  const aca = new URL(href);
  const cuerpo: CuerpoDelEvento = { evento };
  if (clave) cuerpo.clave = clave;
  try {
    const de = new URL(referrer);
    if (de.origin !== aca.origin && de.hostname) cuerpo.referido = de.hostname;
  } catch {
    // Sin referido, o uno que no es una URL: Directo.
  }
  const enlace = aca.searchParams.get("utm_medium") === "link" ? aca.searchParams.get("utm_campaign") : null;
  if (enlace) cuerpo.enlace = enlace;
  return cuerpo;
}

/** Avisa el evento sin esperar respuesta; `keepalive` lo deja salir aunque la página se vaya. */
export function contar(evento: string, clave?: string): void {
  try {
    const cuerpo = cuerpoDelEvento(evento, { href: window.location.href, referrer: document.referrer }, clave);
    fetch("/api/contar", { method: "POST", body: JSON.stringify(cuerpo), keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
      () => undefined,
    );
  } catch {
    // Contar nunca rompe la página.
  }
}
