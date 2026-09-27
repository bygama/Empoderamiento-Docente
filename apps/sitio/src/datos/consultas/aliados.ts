import { draftMode } from "next/headers";
import { cache } from "react";
import type { Aliado as Fila, Foto, Prisma } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { esquemaAliado, type Aliado } from "@/features/aliados/contenido/aliado";
import { estaAutorizado } from "@/features/aliados/contenido/autorizacion";
import type { AliadoDelSitio } from "@/features/aliados/contenido/modelo";
import { fotosEn } from "@/lib/contenido/fotos-en";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que leen el sitio y el admin de los aliados (`work/casos-aliados-fotos/SPEC.md`
// §5 y §8). **Sin la marca `autorizado`, un logo no sale nunca** (AGENTS.md
// §5.4): lo filtra la consulta a la base y otra vez `aliadosVisibles`, también
// en la vista previa, y un test lo prueba. **Y la marca vale solo para lo que
// se autorizó**: el documento que se mostraría tiene que tener el logo, el
// nombre y el texto del logo de `autorizado_logo`, `autorizado_nombre` y
// `autorizado_alt`, aunque las columnas se hayan escrito por otro lado.

/** Las columnas de lo publicado, como documento. Sin URL, un texto vacío. */
export function publicadoDeAliado(fila: Fila): unknown {
  return { nombre: fila.nombre, logo: fila.logo, tamano: fila.tamano, url: fila.url ?? "" };
}

type FotoDelLogo = Pick<Foto, "url" | "ancho" | "alto" | "tipo">;

/** El aliado cuyo logo autorizado es esa foto, por el nombre que se autorizó; `null` si no es el de ninguno. */
export async function aliadoConEseLogoAutorizado(db: Prisma.TransactionClient, url: string): Promise<string | null> {
  const fila = await db.aliado.findFirst({ where: { autorizado: true, autorizadoLogo: url }, select: { autorizadoNombre: true, nombre: true } });
  return fila ? (fila.autorizadoNombre ?? fila.nombre ?? "un aliado") : null;
}

/** El documento que mostraría el sitio: en la vista previa, el borrador si se puede publicar; si no, lo publicado. */
function documentoAMostrar(fila: Fila, enVistaPrevia: boolean): Aliado | null {
  const borrador = enVistaPrevia && fila.borrador !== null ? esquemaAliado.safeParse(fila.borrador) : null;
  if (borrador?.success) return borrador.data;
  if (!fila.publicado) return null;
  const publicado = esquemaAliado.safeParse(publicadoDeAliado(fila));
  if (!publicado.success) console.warn(`El aliado ${fila.id} no pasa su esquema; no se muestra.`);
  return publicado.success ? publicado.data : null;
}

/** Lo que muestra el sitio de una fila: ese documento, solo si la marca vale para su logo, su nombre y su alt. */
function documentoVisible(fila: Fila, enVistaPrevia: boolean): Aliado | null {
  const documento = documentoAMostrar(fila, enVistaPrevia);
  return documento && estaAutorizado(documento, fila) ? documento : null;
}

/** Los aliados de la tira, en orden, con las medidas de su logo. Pura: se prueba sin base. */
export function aliadosVisibles(filas: readonly Fila[], fotos: readonly FotoDelLogo[], enVistaPrevia: boolean): AliadoDelSitio[] {
  const porUrl = new Map(fotos.map((f) => [f.url, f]));
  return [...filas]
    .sort((a, b) => a.orden - b.orden)
    .flatMap((fila) => {
      const d = documentoVisible(fila, enVistaPrevia);
      const foto = d ? porUrl.get(d.logo.src) : undefined;
      if (d && !foto) console.warn(`El logo del aliado ${fila.id} no está en Fotos; no se muestra.`);
      if (!d || !foto) return [];
      return [{ id: fila.id, src: foto.url, alt: d.logo.alt, ancho: foto.ancho, alto: foto.alto, vectorial: foto.tipo === "image/svg+xml", tamano: d.tamano, url: d.url || null }];
    });
}

/**
 * La tira de aliados: el pie de todas las páginas, el Inicio y Qué hacemos.
 * Con `cache` de React: el layout y la página la piden en el mismo pedido.
 * Sin base, ninguno: la tira queda vacía y el sitio compila.
 */
/** Las filas con la marca y las fotos de sus logos: lo que `aliadosVisibles` filtra. Aparte, para probarlo contra la base. */
export async function tiraEnBase(db: Prisma.TransactionClient): Promise<{ filas: Fila[]; fotos: FotoDelLogo[] }> {
  const filas = await db.aliado.findMany({ where: { autorizado: true, autorizadoLogo: { not: null }, autorizadoNombre: { not: null }, autorizadoAlt: { not: null } } });
  // Los logos de lo publicado y de los borradores: la vista previa puede mostrar uno nuevo.
  const urls = filas.flatMap((f) => fotosEn([f.logo, f.borrador]).map((foto) => foto.src));
  const fotos = await db.foto.findMany({ where: { url: { in: urls } }, select: { url: true, ancho: true, alto: true, tipo: true } });
  return { filas, fotos };
}

export const aliadosDelSitio = cache(async (): Promise<AliadoDelSitio[]> => {
  const leidos = await leerSinRomper("aliadosDelSitio", () => tiraEnBase(base), { filas: [], fotos: [] });
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  return aliadosVisibles(leidos.filas, leidos.fotos, isEnabled);
});
