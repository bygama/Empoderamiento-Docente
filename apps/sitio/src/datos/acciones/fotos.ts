"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { almacenDesdeEntorno } from "@/lib/contenido/almacen";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import { leerImagen } from "@/lib/contenido/imagen";

// Sube una foto desde el formulario (SPEC §4.4). Empieza por la sesión, como
// toda Server Action del admin (AGENTS.md §12); el tipo se verifica por los
// bytes, no por la extensión; sin alt no se guarda.

// El mensaje va en `{ error }`, no como string suelto: esa forma corta es un
// resabio de Zod 3 que react-doctor frena (zod-v4-no-deprecated-error-customization)
// porque puede dejar de aplicarse en un upgrade de Zod sin avisar.
const esquemaSubida = z.object({
  archivo: z.file({ error: "Elegí una foto para subir." }).max(MAXIMO_BYTES, "La foto pesa más de 4 MB: achicala antes de subirla."),
  alt: z
    .string({ error: "El texto alternativo es obligatorio." })
    .trim()
    .min(1, "El texto alternativo es obligatorio.")
    .max(200, "El texto alternativo tiene como mucho 200 caracteres."),
});

export type ResultadoDeSubida =
  | { ok: true; foto: { src: string; alt: string; ancho: number; alto: number } }
  | { ok: false; detalle: string };

export async function subirFoto(datos: FormData): Promise<ResultadoDeSubida> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para subir fotos." };

    const entrada = esquemaSubida.safeParse({ archivo: datos.get("archivo"), alt: datos.get("alt") });
    if (!entrada.success) return { ok: false, detalle: entrada.error.issues[0]?.message ?? "Faltan datos de la foto." };

    const bytes = Buffer.from(await entrada.data.archivo.arrayBuffer());
    const imagen = await leerImagen(bytes);
    if (!imagen) return { ok: false, detalle: "El archivo no es una imagen jpg, png o webp." };

    // El mismo id nombra el archivo y la fila: /api/fotos/<id> en local, fotos/<id>.<ext> en Blob.
    const id = randomUUID();
    const almacen = almacenDesdeEntorno();
    const { url } = await almacen.guardar({ id, tipo: imagen.tipo, bytes });
    try {
      await base.foto.create({
        data: { id, url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto, bytes: bytes.byteLength, tipo: imagen.tipo, subidaPor: sesion.user.name },
      });
    } catch (e) {
      // Si la fila no se pudo crear, el archivo ya subido queda huérfano (en
      // Blob es almacenamiento pago que nadie encuentra): lo borramos, con su
      // propio try para que un fallo del borrado no tape el error original.
      try {
        await almacen.borrar(url);
      } catch {
        // No hay mucho más para hacer: el error que sigue ya cuenta la historia.
      }
      throw e;
    }
    return { ok: true, foto: { src: url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto } };
  } catch (e) {
    // Si esto tira sin capturar, Next reemplaza el editor por su pantalla de error: mejor un aviso en el campo.
    console.error("subirFoto:", e);
    return { ok: false, detalle: "No se pudo guardar la foto; probá de nuevo en un rato." };
  }
}
