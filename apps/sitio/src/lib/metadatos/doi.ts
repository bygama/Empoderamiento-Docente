// Un DOI, como se guarda: en minúsculas (los DOI no distinguen mayúsculas) y
// sin el prefijo con que se pega («https://doi.org/», «doi:»). Sin ED.

// El prefijo 10.<registrante> y, después de la barra, cualquier cosa sin
// espacios: la sintaxis del DOI (ISO 26324) no acota más el sufijo.
const DOI = /^10\.\d{4,9}\/\S+$/;
const PREFIJOS = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i;

/** ¿Es un DOI ya normalizado? */
export function esDoi(texto: string): boolean {
  return DOI.test(texto);
}

/**
 * El DOI de un texto pegado («https://doi.org/10.1590/ABC», «doi: 10.1590/abc»,
 * «10.1590/abc»), normalizado, o `null` si no es un DOI. El sufijo puede venir
 * con caracteres escapados en un link (`%2F`): se decodifican.
 */
export function normalizarDoi(texto: string): string | null {
  let crudo = texto.trim().replace(PREFIJOS, "");
  try {
    crudo = decodeURIComponent(crudo);
  } catch {
    return null;
  }
  const doi = crudo.toLowerCase();
  return esDoi(doi) ? doi : null;
}

/** El link de un DOI: `10.1590/abc` → `https://doi.org/10.1590/abc`. */
export function linkDelDoi(doi: string): string {
  return `https://doi.org/${doi}`;
}
