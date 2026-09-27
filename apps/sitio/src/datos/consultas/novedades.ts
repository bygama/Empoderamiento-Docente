import { draftMode } from "next/headers";
import { cache } from "react";
import type { Novedad as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { anclasDe } from "@/features/novedades/contenido/modelo";
import { compararFechas } from "@/features/novedades/contenido/fechas";
import { esquemaNovedad, type NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que lee el sitio de las novedades (SPEC §7 de `work/novedades-y-kit/`):
// las publicadas o, en vista previa, cada una como quedaría al publicarla.
// Todo pasa por `esquemaNovedad` al leer: una fila que no pasa no llega a la
// pantalla. Son decenas de filas: se leen todas y se filtran acá.

/** Las columnas de lo publicado, como documento: lo que `esquemaNovedad` valida. */
export function publicadoDe(fila: Fila): unknown {
  return {
    slug: fila.slug,
    titulo: fila.titulo,
    bajada: fila.bajada,
    fecha: fila.fecha,
    categoria: fila.categoria,
    imagen: fila.imagen,
    cuerpo: fila.cuerpo ?? [],
    destacada: fila.destacada,
    publicacion: fila.publicacion,
    imagenParaRedes: fila.imagenParaRedes,
  };
}

/** La novedad lista para el sitio, o `null` si el documento no pasa (y se avisa). */
function paraElSitio(documento: unknown, id: string): NovedadDelSitio | null {
  const valida = esquemaNovedad.safeParse(documento);
  if (!valida.success) {
    console.warn(`La novedad ${id} no pasa su esquema; no se muestra.`);
    return null;
  }
  return { ...valida.data, id, cuerpo: anclasDe(valida.data.cuerpo) };
}

/**
 * Qué ve el sitio de cada fila. Fuera de la vista previa, lo publicado. En la
 * vista previa (SPEC §5.4), cada novedad como quedaría al publicarla: las
 * publicadas con su borrador —o como están, si el borrador todavía no se
 * puede publicar— y las que no están en el sitio solo si tienen un borrador
 * que se puede publicar.
 */
function visible(fila: Fila, enVistaPrevia: boolean): NovedadDelSitio | null {
  if (!enVistaPrevia) return fila.publicada ? paraElSitio(publicadoDe(fila), fila.id) : null;
  const borrador = fila.borrador === null ? null : esquemaNovedad.safeParse(fila.borrador);
  if (borrador?.success) return { ...borrador.data, id: fila.id, cuerpo: anclasDe(borrador.data.cuerpo) };
  return fila.publicada ? paraElSitio(publicadoDe(fila), fila.id) : null;
}

/** Las novedades que ve el sitio, de la más nueva a la más vieja. Pura: se prueba sin base. */
export function novedadesVisibles(filas: readonly Fila[], enVistaPrevia: boolean): NovedadDelSitio[] {
  return filas
    .map((fila) => visible(fila, enVistaPrevia))
    .filter((n): n is NovedadDelSitio => n !== null)
    .sort((a, b) => compararFechas(a.fecha, b.fecha) || a.slug.localeCompare(b.slug));
}

/**
 * Las novedades del sitio, en orden. Con `cache` de React: la página, su
 * metadata y el Inicio las piden en el mismo pedido, y la base se consulta una
 * vez. Sin base, ninguna: `/novedades` muestra su estado vacío.
 */
export const novedadesDelSitio = cache(async (): Promise<NovedadDelSitio[]> => {
  const filas = await leerSinRomper("novedadesDelSitio", () => base.novedad.findMany(), []);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  return novedadesVisibles(filas, isEnabled);
});

/**
 * Las publicadas, sin mirar la vista previa: lo que ven el RSS, la imagen
 * para redes y el prerender de las fichas, que corren fuera de un pedido de
 * alguien que edita.
 */
export const novedadesPublicadas = cache(async (): Promise<NovedadDelSitio[]> => {
  const filas = await leerSinRomper("novedadesPublicadas", () => base.novedad.findMany({ where: { publicada: true } }), []);
  return novedadesVisibles(filas, false);
});

/** Los slugs de las fichas publicadas, para prerenderizarlas en el build. */
export async function slugsConFicha(): Promise<string[]> {
  return (await novedadesPublicadas()).filter((n) => n.cuerpo.length > 0).map((n) => n.slug);
}

/** La novedad de una ficha, o `undefined`. */
export async function novedadPorSlug(slug: string): Promise<NovedadDelSitio | undefined> {
  return (await novedadesDelSitio()).find((n) => n.slug === slug);
}

/** Adónde redirige una ruta vieja (el 308 de un slug que cambió), o `null`. */
export async function redireccionDe(ruta: string): Promise<string | null> {
  const fila = await leerSinRomper("redireccionDe", () => base.redireccion.findUnique({ where: { desde: ruta } }), null);
  return fila?.hacia ?? null;
}
