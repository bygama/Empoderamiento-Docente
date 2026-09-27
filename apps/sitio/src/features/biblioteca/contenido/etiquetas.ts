// Cómo se llama, para quien edita, cada campo del formulario de un material.
const ETIQUETAS: Record<string, string> = {
  titulo: "Título",
  autorias: "Autores",
  autores: "Cómo se lee la firma",
  descripcion: "Descripción",
  tipo: "Tipo",
  tema: "Tema",
  publico: "Público",
  fecha: "Fecha",
  formato: "Formato",
  paginas: "Páginas",
  portada: "Portada",
  url: "Link",
  fuente: "Dónde se lee",
  doi: "DOI",
  cita: "Cita APA",
  destacado: "Destacado",
  rotulo: "Rótulo del destacado",
  frase: "Frase del destacado",
  detalle: "Detalle del destacado",
};
const PARTES: Record<string, string> = { src: "Archivo", alt: "Texto alternativo", foco: "Punto de foco", nombre: "Nombre", persona: "Persona del Equipo" };

/**
 * El camino de un campo como lo lee quien edita: `["autorias", 1, "nombre"]` →
 * «Autores › Autor 2 › Nombre». Lo usan los errores del guardado y «Qué
 * cambió».
 */
export function dondeEsta(camino: ReadonlyArray<PropertyKey>): string {
  const [campo, ...resto] = camino.map(String);
  const partes = [ETIQUETAS[campo] ?? campo];
  for (const paso of resto) {
    if (/^\d+$/.test(paso)) partes.push(`Autor ${Number(paso) + 1}`);
    else if (PARTES[paso]) partes.push(PARTES[paso]);
  }
  return partes.join(" › ");
}
