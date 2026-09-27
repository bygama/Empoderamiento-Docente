import type { Aliado as Fila } from "@/../prisma/generado/client";

// Lo que leen el sitio y el admin de los aliados (`work/casos-aliados-fotos/SPEC.md`
// §5 y §8). Las columnas de lo publicado se leen como el documento que valida
// `esquemaAliado`: es lo único que traduce entre las dos formas.

/** Las columnas de lo publicado, como documento. Sin URL, un texto vacío. */
export function publicadoDeAliado(fila: Fila): unknown {
  return { nombre: fila.nombre, logo: fila.logo, tamano: fila.tamano, url: fila.url ?? "" };
}
