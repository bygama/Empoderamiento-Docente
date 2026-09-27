// Qué rutas contesta un sitio por su cuenta, declaradas como sus carpetas de
// Next («/novedades/[slug]», «/api/[[...todo]]»): dónde una redirección se
// aplicaría y dónde no. No sabe de ED: la app declara las suyas.

/**
 * Cómo contesta el sitio una ruta declarada:
 * - `sola`: la contesta su página o su archivo; una redirección ahí no se aplicaría nunca.
 * - `archivos`: una carpeta de `public/`, cuyos archivos se sirven antes que cualquier ruta.
 * - `o-redirige`: la página, si ahí no hay nada, busca una redirección (la atrapa-todo, una ficha por slug).
 */
export type Contesta = "sola" | "archivos" | "o-redirige";

export type RutaDeclarada = { ruta: string; contesta: Contesta };

const escapar = (texto: string) => texto.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

/**
 * El patrón de una ruta declarada, con la sintaxis de las carpetas de Next:
 * `[x]` es un segmento, `[...x]` uno o más, `[[...x]]` ninguno o más, y `*`
 * cualquier tramo dentro de un segmento (el hash que Next le suma a una imagen
 * de metadatos). Una carpeta de archivos abarca lo de adentro con extensión.
 */
export function patronDe({ ruta, contesta }: RutaDeclarada): RegExp {
  if (contesta === "archivos") return new RegExp(`^${escapar(ruta)}/.+\\.[A-Za-z0-9]+$`);
  let cuerpo = "";
  for (const segmento of ruta.split("/").slice(1)) {
    if (/^\[\[\.\.\..+\]\]$/.test(segmento)) cuerpo += "(?:/.+)?";
    else if (/^\[\.\.\..+\]$/.test(segmento)) cuerpo += "/.+";
    else if (/^\[.+\]$/.test(segmento)) cuerpo += "/[^/]+";
    else cuerpo += `/${escapar(segmento).replace(/\*/g, "[^/]*")}`;
  }
  return new RegExp(`^${cuerpo || "/"}$`);
}

/** La declarada que contesta `ruta` sin mirar las redirecciones, o `null` si ahí una se aplicaría. */
export function laContestaSola(ruta: string, declaradas: readonly RutaDeclarada[]): RutaDeclarada | null {
  return declaradas.find((d) => d.contesta !== "o-redirige" && patronDe(d).test(ruta)) ?? null;
}
