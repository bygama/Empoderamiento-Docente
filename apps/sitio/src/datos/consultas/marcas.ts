import { tiposQueVe, type TipoDeActividad } from "@/datos/actividad";
import { base } from "@/datos/cliente";
import { diaISO, fechaUTC, sumarDias } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";

// Las marcas de la curva del Resumen (SPEC de work/metricas-completas/
// §6.1.1): las que se agregan solas al publicar, que salen de `actividad` sin
// que publicar escriba nada más, y las de a mano, de `marcas`.

/** Los tipos de actividad que dejan una marca sola. */
export const TIPOS_QUE_MARCAN = ["publico-una-pagina", "publico-una-novedad"] as const satisfies readonly TipoDeActividad[];
type TipoQueMarca = (typeof TIPOS_QUE_MARCAN)[number];

export type MarcaDeLaCurva = {
  id: string;
  dia: Dia;
  texto: string;
  /** Quién la agregó, en las de a mano; las solas no llevan. */
  aMano: { creadaPor: string } | null;
};

type Publicacion = { tipo: TipoQueMarca; sobre: string | null; sobreId: string | null; en: Date };

const TEXTO: Record<TipoQueMarca, (sobre: string | null) => string> = {
  "publico-una-pagina": (sobre) => `Se publicó ${sobre ?? "una página"}`,
  "publico-una-novedad": (sobre) => (sobre ? `Se publicó la novedad «${sobre}»` : "Se publicó una novedad"),
};

/**
 * Una marca por día y por cosa publicada: publicar tres veces Inicio el mismo
 * día es una sola marca. El día es el UTC, como el de la curva.
 */
export function marcasDeLaActividad(publicaciones: readonly Publicacion[]): MarcaDeLaCurva[] {
  const vistas = new Map<string, MarcaDeLaCurva>();
  for (const p of publicaciones) {
    const dia = diaISO(p.en);
    const id = `publicacion:${dia}:${p.tipo}:${p.sobreId ?? p.sobre ?? ""}`;
    if (!vistas.has(id)) vistas.set(id, { id, dia, texto: TEXTO[p.tipo](p.sobre), aMano: null });
  }
  return [...vistas.values()];
}

/**
 * Las marcas entre dos días, de la más nueva a la más vieja. Las de publicar,
 * solo de los tipos que ese rol puede ver en la actividad (hoy los tres roles
 * ven las dos, pero la regla es de `QUIEN_VE`, no de acá).
 */
export async function marcasDe(desde: Dia, hasta: Dia, rol: unknown): Promise<MarcaDeLaCurva[]> {
  const tipos = tiposQueVe(rol).filter((t): t is TipoQueMarca => (TIPOS_QUE_MARCAN as readonly string[]).includes(t));
  const [publicaciones, aMano] = await Promise.all([
    tipos.length
      ? base.actividad.findMany({
          where: { tipo: { in: tipos }, en: { gte: fechaUTC(desde), lt: fechaUTC(sumarDias(hasta, 1)) } },
          select: { tipo: true, sobre: true, sobreId: true, en: true },
        })
      : [],
    base.marca.findMany({ where: { fecha: { gte: fechaUTC(desde), lte: fechaUTC(hasta) } }, select: { id: true, fecha: true, texto: true, creadaPor: true } }),
  ]);
  const todas = [
    ...marcasDeLaActividad(publicaciones as Publicacion[]),
    ...aMano.map((m) => ({ id: m.id, dia: diaISO(m.fecha), texto: m.texto, aMano: { creadaPor: m.creadaPor } })),
  ];
  return todas.sort((a, b) => b.dia.localeCompare(a.dia) || a.texto.localeCompare(b.texto));
}
