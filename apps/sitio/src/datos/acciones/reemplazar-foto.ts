import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@/../prisma/generado/client";
import { aliadoConEseLogoAutorizado } from "@/datos/consultas/aliados";
import { esDelRepositorio } from "@/datos/consultas/fotos";
import { USOS_DE_FOTOS, usosPorFoto } from "@/datos/fotos/registro";
import type { Regenerar, UsosDeUnModulo } from "@/datos/fotos/uso";
import type { Almacen } from "@/lib/contenido/almacen";
import { noSeReemplazaElLogo } from "@/features/aliados/contenido/autorizacion";
import { leerImagen } from "@/lib/contenido/imagen";
import { dondeSeUsa, type Fallo } from "./editar-fotos";
import { esquemaSubida } from "./subir-foto";

// Reemplazar el archivo de una foto (`work/casos-aliados-fotos/SPEC.md`
// §3.4). Los usos siguen apuntando a la misma foto: el id, la ficha y el alt
// no cambian, y la URL nueva se escribe en cada uso de la base en la misma
// transacción que la fila. El archivo viejo se borra DESPUÉS de que la
// transacción confirma (resguardo 2 del padre): la base nunca apunta a un
// archivo que no existe; si el borrado falla, lo levanta la tarea de los
// archivos sueltos del cron. **El logo autorizado de un aliado no se
// reemplaza** (AGENTS.md §5.4): cambiaría el logo sin que nadie lo autorice;
// se chequea antes de subir y otra vez adentro de la transacción.

/** Una foto que resultó ser un logo autorizado cuando ya se había subido el archivo nuevo. */
class EsUnLogoAutorizado extends Error {
  constructor(readonly aliado: string) {
    super("logo autorizado");
  }
}

const esquemaArchivo = esquemaSubida.shape.archivo;

export async function reemplazarFotoEnBase(
  base: PrismaClient,
  almacen: Almacen,
  { id, archivo, registro = USOS_DE_FOTOS }: { id: string; archivo: unknown; registro?: readonly UsosDeUnModulo[] },
): Promise<{ ok: true; alt: string; regenerar: Regenerar[] } | Fallo> {
  const entrada = esquemaArchivo.safeParse(archivo);
  if (!entrada.success) return { ok: false, detalle: entrada.error.issues[0]?.message ?? "Elegí una foto para subir." };
  const bytes = Buffer.from(await entrada.data.arrayBuffer());
  // Por los bytes, como al subir: un SVG no pasa aunque se llame .png.
  const imagen = await leerImagen(bytes);
  if (!imagen) return { ok: false, detalle: "El archivo no es una imagen jpg, png o webp." };

  const fila = await base.foto.findUnique({ where: { id } });
  if (!fila) return { ok: false, detalle: "Esa foto ya no existe: la borraron desde que la abriste." };
  const logoDe = await aliadoConEseLogoAutorizado(base, fila.url);
  if (logoDe) return { ok: false, detalle: noSeReemplazaElLogo(logoDe) };
  const enElCodigo = ((await usosPorFoto(base, registro)).get(fila.url) ?? []).filter((u) => u.en === "codigo");
  if (enElCodigo.length) {
    return {
      ok: false,
      detalle: `No se puede reemplazar: la usa ${dondeSeUsa(enElCodigo)}, que todavía muestra el contenido del código. Cambiala desde su editor, o publicá esa página y volvé acá.`,
    };
  }

  // Un nombre nuevo para el archivo: el viejo puede seguir en la caché de alguien, y en Blob no se pisa.
  const { url } = await almacen.guardar({ id: randomUUID(), tipo: imagen.tipo, bytes });
  let regenerar: Regenerar[];
  try {
    regenerar = await base.$transaction(async (tx) => {
      const recienAutorizado = await aliadoConEseLogoAutorizado(tx, fila.url);
      if (recienAutorizado) throw new EsUnLogoAutorizado(recienAutorizado);
      const cambios = (await Promise.all(registro.map((m) => m.reemplazar(tx, fila.url, url)))).flat();
      await tx.foto.update({ where: { id }, data: { url, ancho: imagen.ancho, alto: imagen.alto, bytes: bytes.byteLength, tipo: imagen.tipo } });
      return cambios;
    });
  } catch (e) {
    // La base quedó como estaba: el archivo nuevo no lo usa nadie.
    try {
      await almacen.borrar(url);
    } catch {
      // Lo levanta la tarea de los archivos sueltos.
    }
    if (e instanceof EsUnLogoAutorizado) return { ok: false, detalle: noSeReemplazaElLogo(e.aliado) };
    throw e;
  }
  if (!esDelRepositorio(fila.url)) {
    try {
      await almacen.borrar(fila.url);
    } catch (e) {
      console.error("reemplazarFoto: el archivo viejo quedó, lo levanta la tarea de los sueltos:", e instanceof Error ? e.name : "error");
    }
  }
  return { ok: true, alt: fila.alt, regenerar };
}
