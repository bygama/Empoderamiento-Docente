import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { EXTENSION_POR_TIPO, type TipoDeImagen } from "./imagen";

// Dónde queda el archivo de una foto (SPEC §4.4): en Vercel, Blob; en local,
// una carpeta de la app servida por /api/fotos/[id]. La misma interfaz para
// las dos, así lo visual no espera a la cuenta de Vercel.

export type Almacen = {
  guardar(foto: { id: string; tipo: TipoDeImagen; bytes: Buffer }): Promise<{ url: string }>;
  borrar(url: string): Promise<void>;
};

/** Relativa a la app (`process.cwd()` es `apps/sitio` con `next dev`). Git-ignorada. */
export const CARPETA_LOCAL = ".fotos";

export function carpetaLocal(): string {
  return path.resolve(process.cwd(), CARPETA_LOCAL);
}

export function hayBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function almacenEnDisco(carpeta: string): Almacen {
  return {
    async guardar({ id, tipo, bytes }) {
      await mkdir(carpeta, { recursive: true });
      // En producción las fotos van a Blob (almacenEnBlob no toca el disco):
      // esta ruta es solo el fallback local, no hay nada real para rastrear.
      await writeFile(path.join(/*turbopackIgnore: true*/ carpeta, `${id}.${EXTENSION_POR_TIPO[tipo]}`), bytes);
      return { url: `/api/fotos/${id}` };
    },
    async borrar(url) {
      // La URL local es /api/fotos/<id>: el último segmento es el id que buscarEnDisco resuelve a archivo.
      const archivo = await buscarEnDisco(carpeta, path.basename(url));
      if (archivo) await unlink(archivo.ruta);
    },
  };
}

export function almacenEnBlob(token: string): Almacen {
  return {
    async guardar({ id, tipo, bytes }) {
      // El id ya es único: sin sufijo aleatorio la URL queda legible.
      const subida = await put(`fotos/${id}.${EXTENSION_POR_TIPO[tipo]}`, bytes, {
        access: "public",
        contentType: tipo,
        token,
        // Mismo año inmutable que sirve la ruta local (route.ts): la foto no cambia, solo su id.
        cacheControlMaxAge: 31536000,
      });
      return { url: subida.url };
    },
    async borrar(url) {
      await del(url, { token });
    },
  };
}

/** Blob si hay token; si no, el disco. */
export function almacenDesdeEntorno(): Almacen {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? almacenEnBlob(token) : almacenEnDisco(carpetaLocal());
}

// Un UUID v4 y nada más: es lo único que la ruta pública acepta como nombre,
// así nadie pide `../.env.local`.
const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Object.entries pierde el tipo de la clave (da string): el `as` lo devuelve, y las claves son exactamente las de EXTENSION_POR_TIPO.
const EXTENSIONES = Object.entries(EXTENSION_POR_TIPO) as Array<[TipoDeImagen, string]>;

/** El archivo de una foto del disco, con su tipo, o `null`. */
export async function buscarEnDisco(carpeta: string, id: string): Promise<{ ruta: string; tipo: TipoDeImagen } | null> {
  if (!ID_VALIDO.test(id)) return null;
  for (const [tipo, extension] of EXTENSIONES) {
    // Mismo caso que en guardar(): en producción esto ni se llama (Blob no
    // pasa por el disco), así que no hay nada real para el tracing.
    const ruta = path.join(/*turbopackIgnore: true*/ carpeta, `${id}.${extension}`);
    try {
      await access(ruta);
      return { ruta, tipo };
    } catch {
      // No está con esta extensión: probar la siguiente.
    }
  }
  return null;
}
