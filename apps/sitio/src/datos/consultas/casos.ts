import type { Caso as Fila } from "@/../prisma/generado/client";

// Lo que leen el sitio y el admin de los casos (`work/casos-aliados-fotos/SPEC.md`
// §4 y §8). Las columnas de lo publicado se leen como el documento que
// valida `esquemaCaso`: es lo único que traduce entre las dos formas.

/** Las columnas de lo publicado, como documento. La aclaración nula es un texto vacío. */
export function publicadoDeCaso(fila: Fila): unknown {
  return {
    slug: fila.slug,
    pregunta: fila.pregunta,
    eje: fila.eje,
    indicio: fila.indicio,
    periodo: fila.periodo,
    ambito: fila.ambito,
    estado: fila.estado,
    contexto: fila.contexto,
    preguntaInvestigacion: fila.preguntaInvestigacion,
    lamina: fila.lamina,
    evidencias: fila.evidencias,
    analisis: fila.analisis,
    aprendizaje: fila.aprendizaje,
    queCambio: fila.queCambio,
    produccionRelacionada: fila.produccionRelacionada,
    esDemo: fila.esDemo,
    aclaracion: fila.aclaracion ?? "",
  };
}
