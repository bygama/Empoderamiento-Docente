/**
 * Un caso de investigación como lo dibuja el archivo: lo que la escena
 * recibe por props. Los casos viven en la base (`casos`) y se editan en el
 * admin (`work/casos-aliados-fotos/`); `datos/consultas/casos.ts` arma esta
 * forma desde el documento de `esquemaCaso`, con lo que sale de código: el
 * tinte de cada carpeta (por número, `tintes.ts`) y el id y el rótulo de
 * cada evidencia (por posición).
 *
 * Los casos 01 y 02 son REALES y están sostenidos por publicaciones con
 * arbitraje de ED. Los 03 y 04 son provisionales: cubren evaluación y
 * currículum hasta que haya caso real, y su aclaración lo dice. `esDemo`
 * prende la etiqueta «DEMO» y la aclaración al pie (hoy, en ninguno).
 */

/** Tinte de carpeta — mapeado a tokens del design system en los componentes. */
export type TinteCarpeta = "navy" | "medio" | "claro" | "verde";

export type EvidenciaCaso = {
  id: string;
  /** Rótulo chico tipo expediente ("EVIDENCIA 01"). */
  rotulo: string;
  /** Título del artefacto, como se rotularía en un archivo real. */
  titulo: string;
  /** Bajada breve del contenido que representará el archivo real. */
  descripcion: string;
  /** Si puede arrastrarse en desktop (no todas: el texto esencial nunca). */
  movible: boolean;
};

export type RecursoRelacionado = {
  titulo: string;
  href: string;
};

/** Lámina visual del expediente (ilustración/registro), sujeta a la hoja. */
export type LaminaCaso = {
  src: string;
  alt: string;
  /** Cómo está sujeta a la hoja: clip metálico, cinta o esquinas de foto. */
  sujecion: "clip" | "cinta" | "esquinas";
  rotulo: string;
};

/** Ficha catalográfica: la línea de identidad del expediente abierto. */
export type FichaCaso = {
  periodo: string;
  ambito: string;
  estado: "EN CURSO" | "CERRADO";
};

export type CasoInvestigacion = {
  id: string;
  slug: string;
  numero: string;
  esDemo: boolean;
  /** Pregunta-título: el elemento editorial principal del caso. */
  pregunta: string;
  eje: string;
  /** Frase-anzuelo ultracorta del bloque de anticipación (hover cerrado). */
  indicio: string;
  ficha: FichaCaso;
  tinte: TinteCarpeta;
  contexto: string;
  preguntaInvestigacion: string;
  lamina: LaminaCaso;
  evidencias: EvidenciaCaso[];
  analisis: string;
  /** Se muestra como nota manuscrita al margen: corta y humana. */
  aprendizaje: string;
  queCambio: string;
  produccionRelacionada: RecursoRelacionado[];
  aclaracion?: string;
};

export const ETIQUETA_DEMO = "CASO DEMO — CONTENIDO PROVISIONAL";
