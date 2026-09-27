// Cómo se llama, para quien edita, cada campo del formulario de una novedad.
const ETIQUETAS: Record<string, string> = {
  slug: "URL",
  titulo: "Título",
  bajada: "Bajada",
  fecha: "Fecha",
  categoria: "Categoría",
  imagen: "Imagen",
  cuerpo: "Cuerpo",
  destacada: "Destacada",
  publicacion: "Publicación de la Biblioteca",
  imagenParaRedes: "Imagen para redes",
};
const PARTES: Record<string, string> = { src: "Archivo", alt: "Texto alternativo", foco: "Punto de foco", titulo: "Título", parrafos: "Texto" };

/**
 * El camino de un campo como lo lee quien edita: `["cuerpo", 1, "titulo"]` →
 * «Cuerpo › Sección 2 › Título». Lo usan los errores del guardado y «Qué
 * cambió».
 */
export function dondeEsta(camino: ReadonlyArray<PropertyKey>): string {
  const [campo, ...resto] = camino.map(String);
  const partes = [ETIQUETAS[campo] ?? campo];
  for (const paso of resto) {
    if (/^\d+$/.test(paso)) partes.push(`Sección ${Number(paso) + 1}`);
    else if (PARTES[paso]) partes.push(PARTES[paso]);
  }
  return partes.join(" › ");
}
