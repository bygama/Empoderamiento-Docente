import { posicionDelFoco, type Foco, type ValorDeFoto } from "@ed/kit-admin/foto";

// Cómo se muestra una foto guardada en el contenido: `src`, `alt` y el
// `object-position` que sale del punto de foco (SPEC §4.4). Sin Zod y sin
// sharp: lo importan componentes del navegador. El esquema del campo vive en
// campos.ts y usa lo de acá. Qué es una foto y su foco lo define el control
// que la edita (`@ed/kit-admin/foto`, sin React): acá se re-exporta, así el
// sitio y el admin dicen lo mismo.

export { posicionDelFoco };
export type { Foco };
export type ValorFoto = ValorDeFoto;

/** 4 MB: Vercel corta el cuerpo de una función en 4,5 MB (DECISIONS, 3). Se chequea en el navegador y en el servidor. */
export const MAXIMO_BYTES = 4 * 1024 * 1024;

// Un segmento de ruta que no es "." ni "..", ni "%2e"/"%2f" percent-encoded
// (mayúscula o minúscula) escondido adentro: sin el primer freno,
// "/fotos/../.env.local" pasaba como foto válida y se colaba un path
// traversal hasta afuera de public/; sin el segundo, lo mismo colaba
// codificado ("/fotos/..%2F.env.local"). El servidor de estáticos de Next no
// decodifica "%2e"/"%2f" a un salto de carpeta, así que hoy no hay traversal
// real por acá, pero es defensa en profundidad contra quien arma a mano el
// payload de la acción (M-1 de la revisión). No afecta a un nombre de
// archivo que solo empieza con punto.
const SEGMENTO_DE_RUTA = /(?!\.{1,2}\/|\.{1,2}$)(?:(?!%2[eEfF])[^\s?#/])+/;
// Las carpetas de public/ con fotos del contenido, que son las que entraron a
// la biblioteca de Fotos (work/casos-aliados-fotos/SPEC.md §3.1): las fotos,
// la imagen de una novedad, las láminas de los casos y los logos de los
// aliados; más las portadas tipográficas de la Biblioteca (work/biblioteca/)
// y los retratos del Equipo (work/equipo/). Una lista, no «cualquier
// carpeta»: public/ también tiene la marca y PDF, que no son una foto del
// contenido.
const CARPETAS_DE_FOTOS = ["fotos", "novedades", "investigacion", "aliados", "biblioteca/portadas", "equipo"];
const RUTA_DE_FOTO = new RegExp(String.raw`/(?:${CARPETAS_DE_FOTOS.join("|")})/(?:${SEGMENTO_DE_RUTA.source}/)*${SEGMENTO_DE_RUTA.source}`);

// Lo que el sitio sabe mostrar sin salir de su origen: sus fotos de public/ y
// las subidas en local.
const SRC_DEL_SITIO = new RegExp(String.raw`^(?:${RUTA_DE_FOTO.source}|/api/fotos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$`);
// Una foto de Blob: cualquier store, su carpeta fotos/, con los mismos frenos de segmento.
const FOTO_DE_BLOB = new RegExp(String.raw`^https://([a-z0-9-]+\.public\.blob\.vercel-storage\.com)/fotos/(?:${SEGMENTO_DE_RUTA.source}/)*${SEGMENTO_DE_RUTA.source}$`);

/**
 * El host de Blob contra el que se valida mientras corre `validarComoAlGuardar`;
 * `undefined` cuando se lee. La validación de Zod es sincrónica, así que el
 * valor vive lo que dura esa llamada y ningún otro pedido lo ve.
 */
let hostAlGuardar: string | null | undefined;

/**
 * Corre `validar` con la regla de guardar: de Blob, solo las fotos del store
 * del sitio (`hostDeFotos`, de `hostDelBlob`; `null` es que no hay store y no
 * entra ninguna). La pasa explícita quien guarda (datos/acciones/al-guardar.ts):
 * el esquema no lee el entorno.
 */
export function validarComoAlGuardar<T>(hostDeFotos: string | null, validar: () => T): T {
  const antes = hostAlGuardar;
  hostAlGuardar = hostDeFotos;
  try {
    return validar();
  } finally {
    hostAlGuardar = antes;
  }
}

/**
 * Lo que el sitio sabe mostrar: sus fotos de public/, las subidas en local y
 * las de Blob, en su carpeta fotos/.
 *
 * **De Blob, la regla depende de si se lee o se guarda.** Al leer, cualquier
 * store: lo guardado no se esconde ni vuelve al contenido inicial porque cambió
 * el token (otro store, una mudanza de host, local leyendo una base con fotos
 * de Blob), y next/image y la CSP ya no dejan mostrar una de otro store
 * (host-del-blob.ts). Al guardar desde el admin (`validarComoAlGuardar`), solo
 * las del store del sitio.
 */
export function esSrcDeFoto(src: string): boolean {
  if (SRC_DEL_SITIO.test(src)) return true;
  const host = FOTO_DE_BLOB.exec(src)?.[1];
  if (!host) return false;
  if (hostAlGuardar === undefined) return true;
  if (hostAlGuardar === null) return false;
  return hostAlGuardar.startsWith("*.") ? host.endsWith(hostAlGuardar.slice(1)) : host === hostAlGuardar;
}

/**
 * El `style` del `<Image>` del sitio, o `undefined` cuando el foco redondea al
 * centro: es el default del navegador, y así el HTML de las fotos de hoy
 * queda byte a byte igual que antes de esta lane. Compara el resultado ya
 * redondeado, no `x`/`y` crudos: un foco como 0.498 también tiene que dar
 * centro, porque `posicionDelFoco` ya lo redondea a "50% 50%".
 */
export function estiloDeFoco(foco: Foco): { objectPosition: string } | undefined {
  const posicion = posicionDelFoco(foco);
  return posicion === "50% 50%" ? undefined : { objectPosition: posicion };
}

/** Lo que una foto del contenido tiene para mostrarse, con la posición siempre explícita. */
export function resolverFoto(valor: ValorFoto): { src: string; alt: string; objectPosition: string } {
  return { src: valor.src, alt: valor.alt, objectPosition: posicionDelFoco(valor.foco) };
}

/** Una foto de `public/`, centrada: la forma del contenido inicial. Cada llamada trae su propio foco, para que nadie lo comparta por referencia. */
export function fotoDeRuta(src: string, alt: string): ValorFoto {
  return { src, alt, foco: { x: 0.5, y: 0.5 } };
}
