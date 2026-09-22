// El resumen de un ítem de lista, para mostrarlo cerrado: su primera foto y
// una línea de texto. Sale de la descripción y del valor, sin saber de qué
// sección es; por eso vive acá y no en el admin (AGENTS.md §12).

import type { Descripcion } from "./descripcion";
import type { ValorFoto } from "./fotos";

export type Resumen = { foto: ValorFoto | null; texto: string };

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function esFoto(valor: unknown): valor is ValorFoto {
  return esObjeto(valor) && typeof valor.src === "string" && valor.src !== "" && typeof valor.alt === "string";
}

/** Recorre en el orden del formulario y anota lo primero de cada cosa. */
function recorrer(d: Descripcion, valor: unknown, hallado: { foto: ValorFoto | null; texto: string | null }) {
  switch (d.tipo) {
    case "textoCorto":
      if (hallado.texto === null && typeof valor === "string" && valor.trim() !== "") hallado.texto = valor.trim();
      return;
    case "foto":
      if (hallado.foto === null && esFoto(valor)) hallado.foto = valor;
      return;
    case "opcional":
      if (valor !== null) recorrer(d.de, valor, hallado);
      return;
    case "grupo":
      if (esObjeto(valor)) for (const c of d.campos) recorrer(c.descripcion, valor[c.clave], hallado);
      return;
    case "listaFija":
      if (Array.isArray(valor)) for (const item of valor) recorrer(d.item, item, hallado);
      return;
    case "parrafo":
    case "rutaInterna":
      return;
  }
}

/**
 * La primera foto del ítem (con su foco) y su texto: el primer texto corto no
 * vacío o, si no hay, el alt de esa foto. Un valor que no tiene la forma de
 * la descripción da un resumen vacío, nunca una excepción.
 */
export function resumirItem(descripcion: Descripcion, valor: unknown): Resumen {
  const hallado: { foto: ValorFoto | null; texto: string | null } = { foto: null, texto: null };
  recorrer(descripcion, valor, hallado);
  return { foto: hallado.foto, texto: hallado.texto ?? hallado.foto?.alt ?? "" };
}
