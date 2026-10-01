import { base } from "@/datos/cliente";
import { esquemaBorradorDeCaso, esquemaCaso, type BorradorDeCaso, type Caso } from "@/features/investigacion/contenido/caso";
import { esIdDeCaso, type IdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import { comoDocumento } from "@/lib/contenido/documento";
import { publicadoDeCaso } from "./casos";

// Lo que leen la lista y la ficha de Casos en el admin
// (`work/casos-aliados-fotos/SPEC.md` §7.1). Las fechas viajan como ISO: el
// navegador las muestra en la zona de quien mira.

export type EstadoDelCaso = { publicadoEn: string | null; publicadoPor: string | null; borradorEn: string | null; borradorPor: string | null };

export type FilaDeCaso = { id: IdDeCaso; numero: string; pregunta: string; eje: string; estado: EstadoDelCaso };

const texto = (v: unknown) => (typeof v === "string" ? v : "");

function estadoDe(f: { publicadoEn: Date | null; publicadoPor: string | null; borradorEn: Date | null; borradorPor: string | null }): EstadoDelCaso {
  return {
    publicadoEn: f.publicadoEn?.toISOString() ?? null,
    publicadoPor: f.publicadoPor,
    borradorEn: f.borradorEn?.toISOString() ?? null,
    borradorPor: f.borradorPor,
  };
}

/** Los fijos, en el orden de la pila, con la pregunta y el eje de lo que se edita (el borrador, si hay). */
export async function listaDeCasos(): Promise<FilaDeCaso[]> {
  const filas = await base.caso.findMany({ orderBy: { numero: "asc" } });
  return filas.flatMap((f) => {
    if (!esIdDeCaso(f.id)) return [];
    const d = comoDocumento(f.borrador);
    return [{ id: f.id, numero: f.numero, pregunta: texto(d.pregunta) || f.pregunta, eje: texto(d.eje) || f.eje, estado: estadoDe(f) }];
  });
}

export type FichaDeCaso = {
  id: IdDeCaso;
  numero: string;
  /** Lo que se edita: el borrador, o lo publicado si no hay borrador. */
  documento: BorradorDeCaso;
  /** Lo que está en el sitio: un caso siempre está publicado. */
  publicado: Caso;
  estado: EstadoDelCaso;
};

export async function fichaDeCaso(id: string): Promise<FichaDeCaso | null> {
  if (!esIdDeCaso(id)) return null;
  const fila = await base.caso.findUnique({ where: { id } });
  if (!fila) return null;
  const publicado = esquemaCaso.safeParse(publicadoDeCaso(fila));
  if (!publicado.success) {
    console.warn(`El caso ${id} tiene lo publicado roto; no se abre.`);
    return null;
  }
  const borrador = fila.borrador === null ? null : esquemaBorradorDeCaso.safeParse(fila.borrador);
  if (borrador && !borrador.success) console.warn(`El caso ${id} tiene un borrador que no pasa su esquema; se abre con lo publicado.`);
  return { id, numero: fila.numero, documento: borrador?.success ? borrador.data : publicado.data, publicado: publicado.data, estado: estadoDe(fila) };
}
