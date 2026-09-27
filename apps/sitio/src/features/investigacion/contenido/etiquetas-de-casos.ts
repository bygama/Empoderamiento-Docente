// Cómo se llama, para quien edita, cada campo del formulario de un caso. Lo
// usan los errores del guardado, las etiquetas del formulario y «Qué cambió».

export const ETIQUETAS_DEL_CASO: Record<string, string> = {
  slug: "URL",
  pregunta: "Pregunta",
  eje: "Eje",
  indicio: "Indicio",
  periodo: "Período",
  ambito: "Ámbito",
  estado: "Estado",
  contexto: "Contexto",
  preguntaInvestigacion: "Pregunta de investigación",
  lamina: "Lámina",
  evidencias: "Evidencias",
  analisis: "Análisis",
  aprendizaje: "Aprendizaje",
  queCambio: "Lo que cambió con el caso",
  produccionRelacionada: "Producción relacionada",
  esDemo: "Caso provisional",
  aclaracion: "Aclaración",
};

const PARTES: Record<string, string> = {
  foto: "Foto",
  src: "Archivo",
  alt: "Texto alternativo",
  foco: "Punto de foco",
  sujecion: "Sujeción",
  rotulo: "Rótulo",
  titulo: "Título",
  descripcion: "Descripción",
  movible: "Se puede arrastrar",
  href: "Lleva a",
};

/** Cómo se llama un ítem de una lista, por la lista en la que está. */
const ITEM: Record<string, string> = { evidencias: "Evidencia", produccionRelacionada: "Producción" };

/**
 * El camino de un campo como lo lee quien edita: `["evidencias", 1, "titulo"]`
 * → «Evidencias › Evidencia 2 › Título».
 */
export function dondeEstaEnElCaso(camino: ReadonlyArray<PropertyKey>): string {
  const [campo, ...resto] = camino.map(String);
  const partes = [ETIQUETAS_DEL_CASO[campo] ?? campo];
  for (const paso of resto) {
    if (/^\d+$/.test(paso)) partes.push(`${ITEM[campo] ?? "Ítem"} ${Number(paso) + 1}`);
    else if (PARTES[paso]) partes.push(PARTES[paso]);
  }
  return partes.join(" › ");
}
