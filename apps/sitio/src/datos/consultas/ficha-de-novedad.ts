import { base } from "@/datos/cliente";
import { borradorVacio } from "@/features/novedades/contenido/modelo";
import { esquemaBorrador, esquemaNovedad, type BorradorDeNovedad, type Novedad } from "@/features/novedades/contenido/novedad";
import { tituloDe } from "@/datos/acciones/novedades-en-base";
import { publicadoDe } from "./novedades";

// Lo que lee la ficha de una novedad en el admin (SPEC §6.2 de
// `work/novedades-y-kit/`): lo que se edita, lo publicado para «Qué cambió» y
// el slug viejo, y lo que el panel necesita de las demás. Las fechas viajan
// como ISO: el navegador las muestra en la zona de quien mira.

export type EstadoDeLaFicha = {
  publicada: boolean;
  publicadaEn: string | null;
  publicadaPor: string | null;
  borradorEn: string | null;
  borradorPor: string | null;
};

export type FichaDeNovedad = {
  id: string;
  /** Lo que se edita: el borrador, o lo publicado si no hay borrador. */
  documento: BorradorDeNovedad;
  /** Lo que está en las columnas, o `null` si nunca se publicó. */
  publicado: Novedad | null;
  estado: EstadoDeLaFicha;
};

/** Lo que la ficha necesita de las demás: cuál es la destacada, y las fechas de las publicadas para «Se ve en». */
export type Vecinas = { destacada: { id: string; titulo: string } | null; publicadas: Array<{ id: string; fecha: string }> };

// `en-CA` porque da AAAA-MM-DD; la zona es la de ED (la del sitio, en español rioplatense).
const DIA_EN_ARGENTINA = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

/** Hoy, como fecha de una novedad nueva. */
export function hoy(ahora: Date = new Date()): string {
  return DIA_EN_ARGENTINA.format(ahora);
}

export async function fichaDeNovedad(id: string): Promise<FichaDeNovedad | null> {
  const fila = await base.novedad.findUnique({ where: { id } });
  if (!fila) return null;
  const publicado = fila.publicadaEn ? esquemaNovedad.safeParse(publicadoDe(fila)) : null;
  const documento = esquemaBorrador.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!documento.success) console.warn(`La novedad ${id} tiene un borrador que no pasa su esquema; se abre vacía.`);
  return {
    id,
    documento: documento.success ? documento.data : { ...borradorVacio(hoy()), titulo: tituloDe(fila) },
    publicado: publicado?.success ? publicado.data : null,
    estado: {
      publicada: fila.publicada,
      publicadaEn: fila.publicadaEn?.toISOString() ?? null,
      publicadaPor: fila.publicadaPor,
      borradorEn: fila.borradorEn?.toISOString() ?? null,
      borradorPor: fila.borradorPor,
    },
  };
}

export async function vecinasDe(): Promise<Vecinas> {
  const publicadas = await base.novedad.findMany({ where: { publicada: true }, select: { id: true, fecha: true, destacada: true, titulo: true, borrador: true } });
  const destacada = publicadas.find((n) => n.destacada);
  return {
    destacada: destacada ? { id: destacada.id, titulo: tituloDe(destacada) } : null,
    publicadas: publicadas.map((n) => ({ id: n.id, fecha: n.fecha ?? "" })),
  };
}
