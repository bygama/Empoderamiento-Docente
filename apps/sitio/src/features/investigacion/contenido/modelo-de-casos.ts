// Lo de un caso que no necesita Zod (`work/casos-aliados-fotos/SPEC.md` §4):
// los casos fijos, las listas cerradas y los topes. Aparte de caso.ts
// (los esquemas) porque lo leen también los componentes del navegador —el
// formulario del admin— y Zod no tiene que viajar con ellos.

/**
 * **Los casos son estos y nada más**: el sitio y el admin muestran solo las
 * filas de esta lista. Eran cuatro; el 02 y el 03 salieron a pedido de
 * Daniela (2026-09-30) con la migración `casos_que_quedan`, que borró sus
 * filas y pasó el `caso-04` al número 02 para que la pila no quede con un
 * hueco. Se editan, no se crean ni se borran desde el admin. El id es el de
 * la fila (por eso el segundo sigue siendo `caso-04`) y el número, su lugar
 * en la pila: ninguno de los dos se edita. La escena tiene tintes, pestañas
 * y papeles para cuatro carpetas; con menos, usa los primeros.
 */
export const CASOS_FIJOS = [
  { id: "caso-01", numero: "01" },
  { id: "caso-04", numero: "02" },
] as const;

export type IdDeCaso = (typeof CASOS_FIJOS)[number]["id"];

export const IDS_DE_CASOS = CASOS_FIJOS.map((c) => c.id) as [IdDeCaso, ...IdDeCaso[]];

export function esIdDeCaso(valor: string): valor is IdDeCaso {
  return (IDS_DE_CASOS as readonly string[]).includes(valor);
}

/**
 * El caso que muestra en acción a cada línea de investigación, por su lugar
 * en la lista: el id del caso cuyo expediente abre «Ver en acción». Va por id
 * y no por slug, que se edita en el admin: el link lleva al slug que el caso
 * tenga hoy (SPEC §4.1). El cruce es editorial (Facundo, 2026-09-14) y hay
 * que validarlo con ED; no se edita desde el admin (SPEC §4 de
 * work/paginas-investigacion-y-resto/). Lo leen las líneas y «Se ve en».
 *
 * Sin el 02 y el 03 (2026-10-01), la 2.ª línea (Socioepistemología) y la 6.ª
 * (Evidencia, evaluación y mejora) pasan al 01: Oaxaca arma la matemática
 * desde el contexto de cada docente —la jícara, el papalote— y es el caso
 * real con sus efectos documentados. El otro sigue con pensamiento matemático
 * y currículum, que es su tema.
 */
export const CASO_DE_CADA_LINEA: readonly IdDeCaso[] = ["caso-01", "caso-01", "caso-01", "caso-04", "caso-04", "caso-01"];

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
