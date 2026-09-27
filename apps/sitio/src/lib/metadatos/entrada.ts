import { normalizarDoi } from "./doi";

// Qué pegó la persona en «DOI, ISBN o link» (SPEC §8 de `work/biblioteca/`):
// un DOI (suelto o su link de doi.org), un ISBN que pasa su dígito
// verificador, o un link. Sin ED.

export type Entrada = { tipo: "doi"; doi: string } | { tipo: "isbn"; isbn: string } | { tipo: "link"; url: string } | { tipo: "nada" };

/** ¿Los 10 dígitos (el último puede ser X) pasan el verificador del ISBN-10? */
function isbn10(d: string): boolean {
  if (!/^\d{9}[\dX]$/.test(d)) return false;
  const suma = [...d].reduce((s, c, i) => s + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
  return suma % 11 === 0;
}

/** ¿Los 13 dígitos (978 o 979) pasan el verificador del ISBN-13? */
function isbn13(d: string): boolean {
  if (!/^97[89]\d{10}$/.test(d)) return false;
  const suma = [...d].reduce((s, c, i) => s + Number(c) * (i % 2 === 0 ? 1 : 3), 0);
  return suma % 10 === 0;
}

/** El ISBN de un texto («ISBN 978-84-16919-43-7»), solo sus dígitos, o `null`. */
export function normalizarIsbn(texto: string): string | null {
  const digitos = texto
    .replace(/^\s*isbn(?:-1[03])?:?\s*/i, "")
    .replace(/[\s-]/g, "")
    .toUpperCase();
  return isbn10(digitos) || isbn13(digitos) ? digitos : null;
}

export function reconocerEntrada(texto: string): Entrada {
  const limpio = texto.trim();
  if (!limpio) return { tipo: "nada" };
  const doi = normalizarDoi(limpio);
  if (doi) return { tipo: "doi", doi };
  const isbn = normalizarIsbn(limpio);
  if (isbn) return { tipo: "isbn", isbn };
  if (/^https?:\/\/\S+$/i.test(limpio) && URL.canParse(limpio)) return { tipo: "link", url: limpio };
  return { tipo: "nada" };
}
