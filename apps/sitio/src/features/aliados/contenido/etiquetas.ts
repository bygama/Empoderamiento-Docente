// Cómo se llama, para quien edita, cada campo del formulario de un aliado. Lo
// usan los errores del guardado y «Qué cambió».

const ETIQUETAS: Record<string, string> = { nombre: "Nombre", logo: "Logo", tamano: "Tamaño en la tira", url: "Su sitio" };
const PARTES: Record<string, string> = { src: "Archivo", alt: "Texto alternativo", foco: "Punto de foco" };

/** El camino de un campo como lo lee quien edita: `["logo", "alt"]` → «Logo › Texto alternativo». */
export function dondeEstaEnElAliado(camino: ReadonlyArray<PropertyKey>): string {
  const [campo, ...resto] = camino.map(String);
  return [ETIQUETAS[campo] ?? campo, ...resto.flatMap((paso) => (PARTES[paso] ? [PARTES[paso]] : []))].join(" › ");
}
