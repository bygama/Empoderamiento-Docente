// Cómo se llama, para quien edita, cada campo del formulario de un perfil del
// Equipo (SPEC §7.2 de `work/equipo/`). Lo usan los errores del guardado y
// «Qué cambió». Sin Zod: lo lee también el navegador.

const CAMPOS: Record<string, string> = {
  slug: "URL",
  nombre: "Nombre",
  rol: "Rol",
  pais: "País",
  nivel: "Nivel",
  foto: "Foto de la tarjeta",
  sinFoto: "Sin foto",
  acercamiento: "Acercamiento",
  recorrido: "Recorrido",
  nombreCompleto: "Nombre completo",
  rolCompleto: "Rol completo",
  lugar: "Dónde vive",
  origen: "De dónde es",
  titular: "Titular",
  intro: "Bajada",
  formacion: "Formación",
  categorias: "Categorías",
  figura: "Figura",
  etapas: "Etapas",
  cierre: "Cierre",
};

const PARTES: Record<string, string> = {
  src: "Archivo",
  alt: "Texto alternativo",
  foco: "Punto de foco",
  foto: "Foto",
  tipo: "Tipo",
  apaisado: "Lámina apaisada",
  etiqueta: "Nombre",
  color: "Color",
  categoria: "Categoría",
  volanta: "Volanta",
  periodo: "Período",
  composicion: "Composición",
  titulo: "Título",
  texto: "Texto",
  textoDos: "Segundo texto",
  cita: "Cita",
  hitos: "Hitos",
  ramas: "Estancias",
  territorios: "Territorios",
  publicaciones: "Publicaciones",
  detalle: "Detalle",
  lugar: "Lugar",
  principal: "Principal",
  material: "Material de la Biblioteca",
  anio: "Año",
  conceptos: "Conceptos",
  destacada: "Destacada",
};

/** Cómo se nombra un ítem según la lista que lo tiene: «Etapa 3», «Hito 2». */
const ITEMS: Record<string, string> = {
  etapas: "Etapa",
  hitos: "Hito",
  ramas: "Estancia",
  territorios: "Territorio",
  publicaciones: "Publicación",
  categorias: "Categoría",
  formacion: "Renglón",
  conceptos: "Concepto",
};

/**
 * El camino de un campo como lo lee quien edita:
 * `["recorrido", "etapas", 2, "publicaciones", 0, "material"]` → «Etapa 3 ›
 * Publicación 1 › Material de la Biblioteca». El recorrido no se nombra
 * cuando sigue algo: su bloque ya lo dice.
 */
export function dondeEsta(camino: ReadonlyArray<PropertyKey>): string {
  const pasos = camino.map(String);
  const [campo, ...resto] = pasos[0] === "recorrido" && pasos.length > 1 ? pasos.slice(1) : pasos;
  const partes = /^\d+$/.test(resto[0] ?? "") ? [] : [CAMPOS[campo] ?? campo];
  const esIndice = (paso: string | undefined) => /^\d+$/.test(paso ?? "");
  resto.forEach((paso, i) => {
    const anterior = i === 0 ? campo : resto[i - 1];
    if (esIndice(paso)) partes.push(`${ITEMS[anterior] ?? "Ítem"} ${Number(paso) + 1}`);
    // Una lista seguida de su índice se nombra por el ítem: «Publicación 1», no «Publicaciones › Publicación 1».
    else if (PARTES[paso] && !(ITEMS[paso] && esIndice(resto[i + 1]))) partes.push(PARTES[paso]);
  });
  return partes.join(" › ");
}
