import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

// Dónde quedan los archivos que **no pueden tener URL pública** (los CV):
// en Vercel, un store de Blob privado; en local, una carpeta git-ignorada.
// Nunca salen por su cuenta: los lee una ruta del admin que ya verificó la
// sesión y el permiso, y los manda ella. No sabe de ED: la app elige la
// variable y la carpeta.

export type ArchivoLeido = { stream: ReadableStream<Uint8Array>; bytes: number };

export type AlmacenPrivado = {
  guardar(clave: string, bytes: Uint8Array, tipo: string): Promise<void>;
  /** El archivo, o `null` si no está. */
  leer(clave: string): Promise<ArchivoLeido | null>;
  /** Borra el archivo; si ya no estaba, no es un error. */
  borrar(clave: string): Promise<void>;
};

// Una carpeta, una barra y un UUID con su extensión, y nada más: así nadie
// arma `../.env.local` con una clave.
const CLAVE_VALIDA = /^[a-z-]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]+$/;

export function claveValida(clave: string): boolean {
  return CLAVE_VALIDA.test(clave);
}

function validar(clave: string): string {
  if (!claveValida(clave)) throw new Error(`La clave «${clave.slice(0, 60)}» no tiene la forma carpeta/uuid.ext.`);
  return clave;
}

export function almacenPrivadoEnDisco(carpeta: string): AlmacenPrivado {
  // En producción los archivos van a Blob: esta ruta es solo la de local, y
  // no hay nada real para que el build la rastree.
  const ruta = (clave: string) => path.join(/*turbopackIgnore: true*/ carpeta, validar(clave));
  return {
    async guardar(clave, bytes) {
      await mkdir(path.dirname(ruta(clave)), { recursive: true });
      await writeFile(ruta(clave), bytes);
    },
    async leer(clave) {
      try {
        const bytes = await readFile(ruta(clave));
        return { stream: new Blob([new Uint8Array(bytes)]).stream(), bytes: bytes.byteLength };
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw e;
      }
    },
    async borrar(clave) {
      try {
        await unlink(ruta(clave));
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      }
    },
  };
}

export function almacenPrivadoEnBlob(token: string): AlmacenPrivado {
  // El token va siempre explícito: así no se usa por error el del store
  // público de las fotos ni el OIDC del proyecto.
  return {
    async guardar(clave, bytes, tipo) {
      await put(validar(clave), Buffer.from(bytes), { access: "private", contentType: tipo, token, addRandomSuffix: false });
    },
    async leer(clave) {
      const r = await get(validar(clave), { access: "private", token, useCache: false });
      return r?.statusCode === 200 ? { stream: r.stream, bytes: r.blob.size } : null;
    },
    async borrar(clave) {
      await del(validar(clave), { token });
    },
  };
}

/**
 * Blob privado si hay token; sin token, la carpeta local, pero **nunca en
 * producción**: ahí el disco de una función no es de nadie y se pierde, así
 * que sin token tira y quien recibe contesta que no puede.
 */
export function almacenPrivado({ token, carpeta, produccion }: { token?: string; carpeta: string; produccion: boolean }): AlmacenPrivado {
  if (token) return almacenPrivadoEnBlob(token);
  if (produccion) throw new Error("Falta el token del store privado: en producción los archivos no van al disco.");
  return almacenPrivadoEnDisco(carpeta);
}
