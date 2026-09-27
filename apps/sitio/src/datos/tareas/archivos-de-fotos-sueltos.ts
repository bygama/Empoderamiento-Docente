import type { PrismaClient } from "@/../prisma/generado/client";
import { base as baseDelSitio } from "@/datos/cliente";
import { almacenDesdeEntorno, type Almacen } from "@/lib/contenido/almacen";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";

// Los archivos de fotos que ninguna fila usa (`work/casos-aliados-fotos/SPEC.md`
// §3.4, resguardo 2 del padre): reemplazar y borrar una foto borran el
// archivo después de la base, y si ese borrado falla, el archivo queda. Una
// vez por día, como una tarea más del cron diario (ADR-0011), se borra de
// Blob o del disco lo que no está en `fotos` y tiene más de un día: una
// subida en curso guarda el archivo antes que su fila. Nunca toca `public/`,
// que es del repositorio: el almacén no lo lista.

/** Cuánto espera un archivo sin fila antes de darlo por suelto. */
export const ESPERA_MS = 24 * 60 * 60 * 1000;

export async function borrarArchivosSueltos(
  { base, almacen, ahora = new Date() }: { base: PrismaClient; almacen: Almacen; ahora?: Date },
): Promise<ResultadoDeTarea> {
  const archivos = await almacen.listar();
  const usados = new Set((await base.foto.findMany({ select: { url: true } })).map((f) => f.url));
  const sueltos = archivos.filter((a) => !usados.has(a.url) && ahora.getTime() - a.guardadoEn.getTime() > ESPERA_MS);
  for (const { url } of sueltos) await almacen.borrar(url);
  return {
    ok: true,
    detalle: sueltos.length
      ? `${sueltos.length === 1 ? "Se borró 1 archivo" : `Se borraron ${sueltos.length} archivos`} de fotos que ninguna fila usa.`
      : "No había archivos de fotos sueltos.",
  };
}

export const archivosDeFotosSueltos: Tarea = {
  clave: "archivos-de-fotos-sueltos",
  nombre: "Archivos de fotos sueltos",
  correr: () => borrarArchivosSueltos({ base: baseDelSitio, almacen: almacenDesdeEntorno() }),
};
