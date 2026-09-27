import { access, mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Almacen } from "./almacen";
import { EXTENSION_POR_TIPO, type TipoDeImagen } from "./imagen";

// El almacén de las fotos en local (SPEC §4.4 de la edición de páginas): una
// carpeta de la app, servida por /api/fotos/[id]. En Vercel las fotos van a
// Blob y esto ni se llama, así que no hay nada real para el tracing de
// Turbopack (los `turbopackIgnore`).

/** Relativa a la app (`process.cwd()` es `apps/sitio` con `next dev`). Git-ignorada. */
export const CARPETA_LOCAL = ".fotos";

export function carpetaLocal(): string {
  return path.resolve(process.cwd(), CARPETA_LOCAL);
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

export function almacenEnDisco(carpeta: string): Almacen {
  return {
    async guardar({ id, tipo, bytes }) {
      await mkdir(carpeta, { recursive: true });
      await writeFile(path.join(/*turbopackIgnore: true*/ carpeta, `${id}.${EXTENSION_POR_TIPO[tipo]}`), bytes);
      return { url: `/api/fotos/${id}` };
    },
    async borrar(url) {
      // La URL local es /api/fotos/<id>: el último segmento es el id que buscarEnDisco resuelve a archivo.
      const archivo = await buscarEnDisco(carpeta, path.basename(url));
      if (archivo) await unlink(archivo.ruta);
    },
    async listar() {
      const archivos = await readdir(carpeta).catch(() => []);
      const fotos = archivos.flatMap((archivo) => {
        const id = archivo.replace(/\.[a-z]+$/, "");
        return ID_VALIDO.test(id) ? [{ id, archivo }] : [];
      });
      return Promise.all(
        fotos.map(async ({ id, archivo }) => ({
          url: `/api/fotos/${id}`,
          guardadoEn: (await stat(path.join(/*turbopackIgnore: true*/ carpeta, archivo))).mtime,
        })),
      );
    },
  };
}
