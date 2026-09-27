import { del, list, put } from "@vercel/blob";
import { almacenEnDisco, carpetaLocal } from "./almacen-en-disco";
import { EXTENSION_POR_TIPO, type TipoDeImagen } from "./imagen";

// Dónde queda el archivo de una foto (SPEC §4.4): en Vercel, Blob; en local,
// una carpeta de la app servida por /api/fotos/[id] (almacen-en-disco.ts). La
// misma interfaz para las dos, así lo visual no espera a la cuenta de Vercel.

export type Almacen = {
  guardar(foto: { id: string; tipo: TipoDeImagen; bytes: Buffer }): Promise<{ url: string }>;
  borrar(url: string): Promise<void>;
  /** Cada archivo que guardó, con su URL y cuándo: lo usa la tarea que borra los que ninguna fila usa. */
  listar(): Promise<Array<{ url: string; guardadoEn: Date }>>;
};

export function hayBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
    async listar() {
      // De a páginas: `list` devuelve hasta mil por vez y un cursor para seguir.
      const todos: Array<{ url: string; guardadoEn: Date }> = [];
      let cursor: string | undefined;
      do {
        const pagina = await list({ prefix: "fotos/", token, cursor });
        todos.push(...pagina.blobs.map((b) => ({ url: b.url, guardadoEn: b.uploadedAt })));
        cursor = pagina.hasMore ? pagina.cursor : undefined;
      } while (cursor);
      return todos;
    },
  };
}

/** Blob si hay token; si no, el disco. */
export function almacenDesdeEntorno(): Almacen {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? almacenEnBlob(token) : almacenEnDisco(carpetaLocal());
}
