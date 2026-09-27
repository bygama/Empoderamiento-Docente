// Lo de un caso que no necesita Zod (`work/casos-aliados-fotos/SPEC.md` §4):
// los cuatro casos fijos, las listas cerradas y los topes. Aparte de caso.ts
// (los esquemas) porque lo leen también los componentes del navegador —el
// formulario del admin— y Zod no tiene que viajar con ellos.

/**
 * **Son siempre cuatro**: la escena de la pila está armada para ellos (las
 * solapas, los papeles, la coreografía que apila la cuarta al final). Se
 * editan, no se crean ni se borran. El id es el de la fila y el número, su
 * lugar en la pila: ninguno de los dos se edita.
 */
export const CASOS_FIJOS = [
  { id: "caso-01", numero: "01" },
  { id: "caso-02", numero: "02" },
  { id: "caso-03", numero: "03" },
  { id: "caso-04", numero: "04" },
] as const;

export type IdDeCaso = (typeof CASOS_FIJOS)[number]["id"];

export const IDS_DE_CASOS = CASOS_FIJOS.map((c) => c.id) as [IdDeCaso, ...IdDeCaso[]];

export function esIdDeCaso(valor: string): valor is IdDeCaso {
  return (IDS_DE_CASOS as readonly string[]).includes(valor);
}

/** Cómo lo nombran el admin y la actividad: «Caso 01». */
export function nombreDelCaso(id: IdDeCaso): string {
  return `Caso ${CASOS_FIJOS.find((c) => c.id === id)?.numero ?? id}`;
}

/** Cómo está sujeta la lámina a la hoja del expediente. */
export const SUJECIONES = [
  { valor: "clip", etiqueta: "Con un clip" },
  { valor: "cinta", etiqueta: "Con cinta" },
  { valor: "esquinas", etiqueta: "Con esquinas de foto" },
] as const;

/** El estado de la ficha técnica, como lo escribe un expediente. */
export const ESTADOS = [
  { valor: "EN CURSO", etiqueta: "En curso" },
  { valor: "CERRADO", etiqueta: "Cerrado" },
] as const;

/**
 * Los largos máximos: los de hoy con aire y lo que la escena aguanta. La
 * pregunta entra en dos renglones de 48 caracteres en la tapa; el indicio,
 * en un renglón fijo; el aprendizaje es una nota al margen, corta.
 */
export const TOPES = {
  pregunta: 96,
  eje: 50,
  indicio: 48,
  periodo: 16,
  ambito: 60,
  contexto: 400,
  preguntaInvestigacion: 180,
  analisis: 320,
  aprendizaje: 90,
  queCambio: 200,
  rotuloDeLamina: 44,
  tituloDeEvidencia: 32,
  descripcionDeEvidencia: 90,
  evidencias: 12,
  tituloDeProduccion: 60,
  producciones: 4,
  aclaracion: 200,
  alt: 200,
} as const;

/**
 * Lo que no puede ser el slug de un caso: los `id` de las secciones de
 * `/investigacion`. El slug va en el ancla (`/investigacion#<slug>`), y con
 * el mismo nombre que una sección, el aterrizaje por link la confundiría.
 */
export const SLUGS_RESERVADOS = ["sentido", "lineas", "ciclo", "evidencia", "en-accion", "expediente-caso", "conversemos", "biblioteca", "contenido"];
