// De dónde se aceptan las fotos del Blob: la CSP (`img-src`, lib/seguridad/
// cabeceras.ts) y las imágenes remotas de next/image (next.config.ts). Sin
// imports a propósito: lo lee también next.config.ts.

const DOMINIO = "public.blob.vercel-storage.com";

/**
 * El host de las fotos públicas del Blob de este sitio, sacado de su token:
 * `vercel_blob_rw_<store>_<secreto>` da `<store>.public.blob.vercel-storage.com`,
 * como arma la URL `@vercel/blob`. Así entra solo el store propio, no el de
 * cualquiera en Vercel.
 *
 * Sin token, `null`: las fotos van a disco y salen del mismo origen
 * (/api/fotos/), y ningún Blob entra. Con un token de otra forma, todo el
 * dominio de Blob, como antes: mejor eso que las fotos rotas.
 */
export function hostDelBlob(token: string | undefined): string | null {
  if (!token) return null;
  const store = /^vercel_blob_rw_([a-z0-9]+)_/i.exec(token)?.[1];
  return store ? `${store.toLowerCase()}.${DOMINIO}` : `*.${DOMINIO}`;
}
