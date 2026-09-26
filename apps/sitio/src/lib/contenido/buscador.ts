// Lo del SEO que no necesita Zod (SPEC §6 de `work/paginas-inicio/`): la
// clave del documento, los largos que muestra un buscador y el recorte con
// «…». Aparte de seo.ts porque lo lee también la vista previa del admin, en
// el navegador, y el esquema trae Zod. Sin ED.

/** La clave del documento donde vive el SEO. Ninguna sección puede llamarse así. */
export const CLAVE_SEO = "seo";

/** Hasta dónde muestra Google antes de cortar con «…». Es una recomendación, no un tope (DECISIONS). */
export const LARGO_DE_BUSCADOR = { titulo: 60, descripcion: 160 } as const;

/** Lo que mostraría un buscador: entero si entra, o cortado en la última palabra que entra, con «…». */
export function recortarComoBuscador(texto: string, largo: number): string {
  if (texto.length <= largo) return texto;
  const corte = texto.slice(0, largo);
  const espacio = corte.lastIndexOf(" ");
  return `${(espacio > 0 ? corte.slice(0, espacio) : corte).trimEnd()}…`;
}
