import { base } from "@/datos/cliente";
import { tituloDe } from "@/datos/acciones/novedades-en-base";

// Lo que el Inicio lee de la tabla `novedades` (SPEC de `work/novedades-y-kit/`
// §10): las que están en borrador y nadie toca hace más de 7 días.

const enLista = new Intl.ListFormat("es", { type: "conjunction" });

/** Cuánto tiene que quedar quieto un borrador para ser un pendiente. */
export const DIAS_DE_UN_BORRADOR_OLVIDADO = 7;

/** «2 novedades en borrador hace más de 7 días» · «Una» y «Otra», o `null` si no hay ninguna. Pura: se prueba sin base. */
export function filaDeBorradoresViejos(titulos: readonly string[]): { titulo: string; detalle: string } | null {
  if (!titulos.length) return null;
  const cuantas = titulos.length === 1 ? "1 novedad" : `${titulos.length} novedades`;
  return { titulo: `${cuantas} en borrador hace más de ${DIAS_DE_UN_BORRADOR_OLVIDADO} días`, detalle: enLista.format(titulos.map((t) => `«${t}»`)) };
}

/**
 * Las que no están en el sitio y tienen un borrador guardado hace más de 7
 * días. Una despublicada sin borrador no cuenta: la sacaron a propósito.
 */
export async function novedadesEnBorradorViejas(ahora: Date = new Date()): Promise<{ titulo: string; detalle: string } | null> {
  const limite = new Date(ahora.getTime() - DIAS_DE_UN_BORRADOR_OLVIDADO * 24 * 60 * 60 * 1000);
  const filas = await base.novedad.findMany({
    where: { publicada: false, borradorEn: { lt: limite } },
    orderBy: { borradorEn: "asc" },
    select: { titulo: true, borrador: true },
  });
  return filaDeBorradoresViejos(filas.map(tituloDe));
}
