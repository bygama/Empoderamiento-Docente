import sharp from "sharp";

// Qué es de verdad un archivo que dice ser una imagen. El tipo sale de los
// bytes y no del nombre ni del `Content-Type` que mandó el navegador (SPEC
// §4.4). `sharp` ya estaba en la app (lo usa next/image) y lee los tres
// formatos que aceptamos. Solo servidor: el tope de bytes, que también se
// chequea en el navegador, vive en fotos.ts.

export type TipoDeImagen = "image/jpeg" | "image/png" | "image/webp";

export const EXTENSION_POR_TIPO: Record<TipoDeImagen, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TIPO_POR_FORMATO: Record<string, TipoDeImagen> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Tipo, ancho y alto de una imagen, o `null` si no es jpg, png o webp (o no es una imagen). */
export async function leerImagen(bytes: Buffer): Promise<{ tipo: TipoDeImagen; ancho: number; alto: number } | null> {
  try {
    const meta = await sharp(bytes).metadata();
    // El índice puede no tener el formato (gif, avif…): por eso el tipo se anota como posible undefined.
    const tipo: TipoDeImagen | undefined = meta.format ? TIPO_POR_FORMATO[meta.format] : undefined;
    if (!tipo || !meta.width || !meta.height) return null;
    return { tipo, ancho: meta.width, alto: meta.height };
  } catch {
    // sharp tira con cualquier cosa que no sea una imagen: para nosotros es «no pasa», no un error.
    return null;
  }
}
