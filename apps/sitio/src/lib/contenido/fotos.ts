// Cómo se muestra una foto guardada en el contenido: `src`, `alt` y el
// `object-position` que sale del punto de foco (SPEC §4.4). Sin Zod y sin
// sharp: lo importan componentes del navegador. El esquema del campo vive en
// campos.ts y usa lo de acá.

export type Foco = { x: number; y: number };
export type ValorFoto = { src: string; alt: string; foco: Foco };

/** 4 MB: Vercel corta el cuerpo de una función en 4,5 MB (DECISIONS, 3). Se chequea en el navegador y en el servidor. */
export const MAXIMO_BYTES = 4 * 1024 * 1024;

// Un segmento de ruta que no es "." ni "..": sin este freno, "/fotos/../.env.local"
// pasaba como foto válida y se colaba un path traversal hasta afuera de
// public/. No afecta a un nombre de archivo que solo empieza con punto.
const SEGMENTO_DE_RUTA = /(?!\.{1,2}\/|\.{1,2}$)[^\s?#/]+/;
const RUTA_DE_FOTO = new RegExp(String.raw`/fotos/(?:${SEGMENTO_DE_RUTA.source}/)*${SEGMENTO_DE_RUTA.source}`);

// Lo único que el sitio sabe mostrar: sus fotos de public/, las subidas en
// local y las del Blob de Vercel (el host de next.config.ts). Un host fuera
// de remotePatterns haría tirar a next/image en cada visita a la home.
const SRC_PERMITIDO = new RegExp(
  String.raw`^(${RUTA_DE_FOTO.source}|/api/fotos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|https://[a-z0-9-]+\.public\.blob\.vercel-storage\.com/[^\s]+)$`,
);

export function esSrcDeFoto(src: string): boolean {
  return SRC_PERMITIDO.test(src);
}

/** `{ x: 0.25, y: 0.5 }` → `"25% 50%"`, lo que `object-position` entiende. */
export function posicionDelFoco(foco: Foco): string {
  return `${Math.round(foco.x * 100)}% ${Math.round(foco.y * 100)}%`;
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
