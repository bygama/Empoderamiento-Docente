import type { Foto } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { usosPorFoto } from "@/datos/fotos/registro";
import type { Uso } from "@/datos/fotos/uso";

// Lo que lee Fotos en el admin (`work/casos-aliados-fotos/SPEC.md` §7.3): la
// grilla con su filtro, la ficha con «Se usa en» y las fotos que se pueden
// elegir en un formulario. Son decenas de fotos: se leen todas.

export const FILTROS_DE_FOTOS = ["todas", "sin-alt", "sin-usar"] as const;
export type FiltroDeFotos = (typeof FILTROS_DE_FOTOS)[number];

export type TarjetaDeFoto = { id: string; src: string; alt: string; ancho: number; alto: number; usos: number };

/** Cuántas hay en cada filtro, para el número de cada píldora. */
export type CuentasDeFotos = Record<FiltroDeFotos, number>;

const sinAlt = (f: Pick<Foto, "alt">) => f.alt.trim() === "";

/** La más nueva primero; las que llegaron juntas con el sitio, por su nombre. */
function masNuevaPrimero(a: Foto, b: Foto): number {
  return b.subidaEn.getTime() - a.subidaEn.getTime() || a.url.localeCompare(b.url);
}

/** Las tarjetas de un filtro y las cuentas de los tres. Pura: se prueba sin base. */
export function grillaDe(filas: readonly Foto[], usos: ReadonlyMap<string, readonly Uso[]>, filtro: FiltroDeFotos): { fotos: TarjetaDeFoto[]; cuentas: CuentasDeFotos } {
  const tarjetas = [...filas].sort(masNuevaPrimero).map((f) => ({ id: f.id, src: f.url, alt: f.alt, ancho: f.ancho, alto: f.alto, usos: usos.get(f.url)?.length ?? 0 }));
  const cuentas = { todas: tarjetas.length, "sin-alt": tarjetas.filter(sinAlt).length, "sin-usar": tarjetas.filter((t) => t.usos === 0).length };
  const fotos = filtro === "sin-alt" ? tarjetas.filter(sinAlt) : filtro === "sin-usar" ? tarjetas.filter((t) => t.usos === 0) : tarjetas;
  return { fotos, cuentas };
}

export async function grillaDeFotos(filtro: FiltroDeFotos) {
  const [filas, usos] = await Promise.all([base.foto.findMany(), usosPorFoto(base)]);
  return grillaDe(filas, usos, filtro);
}

export type FichaDeFoto = {
  id: string;
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  bytes: number;
  tipo: string;
  subidaEn: string;
  subidaPor: string | null;
  /** Un archivo de `public/`: se sirve desde el repositorio y no se borra desde el admin. */
  delRepositorio: boolean;
  usos: Uso[];
};

/** ¿La foto es un archivo de `public/`? Las subidas están en /api/fotos/ (en local) o en Blob. */
export function esDelRepositorio(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("/api/fotos/");
}

export async function fichaDeFoto(id: string): Promise<FichaDeFoto | null> {
  const fila = await base.foto.findUnique({ where: { id } });
  if (!fila) return null;
  const usos = (await usosPorFoto(base)).get(fila.url) ?? [];
  return {
    id,
    src: fila.url,
    alt: fila.alt,
    ancho: fila.ancho,
    alto: fila.alto,
    bytes: fila.bytes,
    tipo: fila.tipo,
    subidaEn: fila.subidaEn.toISOString(),
    subidaPor: fila.subidaPor,
    delRepositorio: esDelRepositorio(fila.url),
    usos,
  };
}

/** Lo que el campo de foto de un formulario muestra para elegir: la foto, su alt (el que toma el uso si no tiene) y sus medidas. */
export type FotoParaElegir = { src: string; alt: string; ancho: number; alto: number };

/** Las que se pueden elegir en un formulario, la más nueva primero: jpg, png y webp, no un SVG (SPEC §7.4). */
export async function paraElegir(): Promise<FotoParaElegir[]> {
  const filas = await base.foto.findMany({ where: { tipo: { in: ["image/jpeg", "image/png", "image/webp"] } } });
  return filas.sort(masNuevaPrimero).map((f) => ({ src: f.url, alt: f.alt, ancho: f.ancho, alto: f.alto }));
}

/** Cuántas hay y cuántas sin texto alternativo: la tarjeta de Contenido y la fila del Inicio. */
export async function resumenDeFotos(): Promise<{ total: number; sinAlt: number }> {
  const [total, sinAltTexto] = await Promise.all([base.foto.count(), base.foto.count({ where: { alt: { equals: "" } } })]);
  return { total, sinAlt: sinAltTexto };
}
