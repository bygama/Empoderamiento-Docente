import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PrismaClient } from "@/../prisma/generado/client";
import type { Almacen } from "@/lib/contenido/almacen";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import { leerImagen } from "@/lib/contenido/imagen";

// Subir una foto a la biblioteca (SPEC §3.4 de `work/casos-aliados-fotos/`),
// con la base y el almacén inyectados para probarlo contra el Postgres local.
// La Server Action de fotos.ts verifica la sesión y llama acá. El tipo se
// verifica por los bytes, no por la extensión ni por lo que dice el
// navegador: un SVG (que puede traer código) no pasa aunque se llame `.png`,
// porque `leerImagen` solo acepta jpg, png y webp (resguardo 1 del padre).

// El mensaje va en `{ error }`, no como string suelto: esa forma corta es un
// resabio de Zod 3 que react-doctor frena (zod-v4-no-deprecated-error-customization).
export const esquemaSubida = z.object({
  archivo: z.file({ error: "Elegí una foto para subir." }).max(MAXIMO_BYTES, "La foto pesa más de 4 MB: achicala antes de subirla."),
  alt: z
    .string({ error: "El texto alternativo es obligatorio." })
    .trim()
    .min(1, "El texto alternativo es obligatorio.")
    .max(200, "El texto alternativo tiene como mucho 200 caracteres."),
});

export type ResultadoDeSubida =
  | { ok: true; foto: { id: string; src: string; alt: string; ancho: number; alto: number } }
  | { ok: false; detalle: string };

export async function subirFotoEnBase(
  base: PrismaClient,
  almacen: Almacen,
  { archivo, alt, quien }: { archivo: unknown; alt: unknown; quien: string },
): Promise<ResultadoDeSubida> {
  const entrada = esquemaSubida.safeParse({ archivo, alt });
  if (!entrada.success) return { ok: false, detalle: entrada.error.issues[0]?.message ?? "Faltan datos de la foto." };

  const bytes = Buffer.from(await entrada.data.archivo.arrayBuffer());
  const imagen = await leerImagen(bytes);
  if (!imagen) return { ok: false, detalle: "El archivo no es una imagen jpg, png o webp." };

  // El mismo id nombra el archivo y la fila: /api/fotos/<id> en local, fotos/<id>.<ext> en Blob.
  const id = randomUUID();
  const { url } = await almacen.guardar({ id, tipo: imagen.tipo, bytes });
  try {
    await base.foto.create({
      data: { id, url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto, bytes: bytes.byteLength, tipo: imagen.tipo, subidaPor: quien },
    });
  } catch (e) {
    // Si la fila no se pudo crear, el archivo ya subido queda huérfano (en
    // Blob es almacenamiento pago que nadie encuentra): lo borramos, con su
    // propio try para que un fallo del borrado no tape el error original. Si
    // aun así queda, lo levanta la tarea de los archivos sueltos del cron.
    try {
      await almacen.borrar(url);
    } catch {
      // No hay mucho más para hacer: el error que sigue ya cuenta la historia.
    }
    throw e;
  }
  return { ok: true, foto: { id, src: url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto } };
}
