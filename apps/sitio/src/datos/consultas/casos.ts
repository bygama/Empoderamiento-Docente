import { draftMode } from "next/headers";
import { cache } from "react";
import type { Caso as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { TINTE_DEL_CASO } from "@/features/investigacion/casos/tintes";
import type { CasoInvestigacion } from "@/features/investigacion/casos/tipos";
import { esquemaCaso, type Caso } from "@/features/investigacion/contenido/caso";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que leen el sitio y el admin de los casos (`work/casos-aliados-fotos/SPEC.md`
// §4 y §8): los cuatro, en el orden de la pila, o en la vista previa cada uno
// como quedaría al publicarlo. Todo pasa por `esquemaCaso` al leer: una fila
// que no pasa no llega a la pantalla.

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

/**
 * Un caso como lo dibuja el archivo, con lo que sale de código: el tinte por
 * número y el id y el rótulo de cada evidencia por su posición.
 */
export function casoParaElSitio(id: string, numero: string, c: Caso): CasoInvestigacion {
  const n = Number(numero);
  return {
    id,
    slug: c.slug,
    numero,
    esDemo: c.esDemo,
    pregunta: c.pregunta,
    eje: c.eje,
    indicio: c.indicio,
    ficha: { periodo: c.periodo, ambito: c.ambito, estado: c.estado },
    tinte: TINTE_DEL_CASO[numero] ?? "navy",
    contexto: c.contexto,
    preguntaInvestigacion: c.preguntaInvestigacion,
    lamina: { src: c.lamina.foto.src, alt: c.lamina.foto.alt, sujecion: c.lamina.sujecion, rotulo: c.lamina.rotulo },
    evidencias: c.evidencias.map((e, i) => ({ id: `c${n}-e${i + 1}`, rotulo: `EVIDENCIA ${String(i + 1).padStart(2, "0")}`, ...e })),
    analisis: c.analisis,
    aprendizaje: c.aprendizaje,
    queCambio: c.queCambio,
    produccionRelacionada: c.produccionRelacionada,
    ...(c.aclaracion ? { aclaracion: c.aclaracion } : {}),
  };
}

/** Lo que el sitio ve de una fila: el borrador en la vista previa, si se puede publicar; si no, lo publicado. */
function visible(fila: Fila, enVistaPrevia: boolean): CasoInvestigacion | null {
  const borrador = enVistaPrevia && fila.borrador !== null ? esquemaCaso.safeParse(fila.borrador) : null;
  const valido = borrador?.success ? borrador : esquemaCaso.safeParse(publicadoDeCaso(fila));
  if (!valido.success) {
    console.warn(`El caso ${fila.id} no pasa su esquema; no se muestra.`);
    return null;
  }
  return casoParaElSitio(fila.id, fila.numero, valido.data);
}

/** Los casos que ve el sitio, en el orden de la pila. Pura: se prueba sin base. */
export function casosVisibles(filas: readonly Fila[], enVistaPrevia: boolean): CasoInvestigacion[] {
  return [...filas]
    .sort((a, b) => a.numero.localeCompare(b.numero))
    .map((fila) => visible(fila, enVistaPrevia))
    .filter((c): c is CasoInvestigacion => c !== null);
}

/**
 * Los casos de `/investigacion`. Con `cache` de React: la sección de los
 * casos y las líneas los piden en el mismo pedido. Sin base, ninguno: la pila
 * queda vacía y el sitio compila.
 */
export const casosDelSitio = cache(async (): Promise<CasoInvestigacion[]> => {
  const filas = await leerSinRomper("casosDelSitio", () => base.caso.findMany(), []);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  return casosVisibles(filas, isEnabled);
});
