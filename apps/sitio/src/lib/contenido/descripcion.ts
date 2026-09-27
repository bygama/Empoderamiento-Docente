import type { Recomendado } from "@ed/kit-admin";

// El árbol que describe un formulario: qué control va en cada lugar y con qué
// etiqueta, largo y ayuda. Sin Zod adentro: sale del servidor como JSON y el
// editor lo recorre en el navegador.

/**
 * Un largo que conviene no pasar sin que sea un tope: el SEO (Google corta el
 * título hacia los 60 caracteres). Pasado, el admin lo dice con `aviso`, pero
 * guarda igual. Es parte del «largo» con que se rotula el campo (AGENTS.md
 * §12), no un tipo nuevo. Lo define el control que lo muestra (`TextoCorto`,
 * en el kit).
 */
export type { Recomendado };

type Base = { etiqueta: string; ayuda?: string };

export type Descripcion =
  | (Base & { tipo: "textoCorto"; maximo: number; recomendado?: Recomendado })
  | (Base & { tipo: "parrafo"; maximo: number })
  | (Base & { tipo: "foto" })
  | (Base & { tipo: "rutaInterna"; opciones: string[] })
  | (Base & { tipo: "listaFija"; cantidad: number; item: Descripcion })
  | (Base & { tipo: "grupo"; campos: Array<{ clave: string; descripcion: Descripcion }> })
  | (Base & { tipo: "opcional"; de: Descripcion });

/** «botonPrincipal» → «Boton principal»: la etiqueta de emergencia cuando el esquema no trae una. */
export function humanizar(clave: string): string {
  const conEspacios = clave.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
}

/** Un valor vacío con la forma que pide la descripción: lo que aparece al activar un opcional. */
export function valorVacio(d: Descripcion): unknown {
  switch (d.tipo) {
    case "textoCorto":
    case "parrafo":
      return "";
    case "rutaInterna":
      return d.opciones[0] ?? "/";
    case "foto":
      return { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };
    case "listaFija":
      return Array.from({ length: d.cantidad }, () => valorVacio(d.item));
    case "grupo":
      return Object.fromEntries(d.campos.map((c) => [c.clave, valorVacio(c.descripcion)]));
    case "opcional":
      return null;
  }
}

// Cómo se llaman, para quien edita, las partes de una foto.
const PARTES_DE_UNA_FOTO: Record<string, string> = { src: "Archivo", alt: "Texto alternativo", foco: "Punto de foco" };

/**
 * El camino de un campo como lo lee quien edita: las etiquetas del formulario
 * y no las claves. `["tarjetas", 2, "foto", "alt"]` → «Tarjetas (computadora)
 * › Tarjeta 3 › Foto › Texto alternativo». Lo usan los avisos de error y «Qué
 * cambió». Un paso que la descripción no conoce se corta ahí.
 */
export function caminoLegible(d: Descripcion, camino: ReadonlyArray<PropertyKey>): string[] {
  const [paso, ...resto] = camino;
  if (paso === undefined) return [];
  switch (d.tipo) {
    case "grupo": {
      const campo = d.campos.find((c) => c.clave === String(paso));
      return campo ? [campo.descripcion.etiqueta, ...caminoLegible(campo.descripcion, resto)] : [];
    }
    case "listaFija":
      return [`${d.item.etiqueta} ${Number(paso) + 1}`, ...caminoLegible(d.item, resto)];
    case "opcional":
      return caminoLegible(d.de, camino);
    case "foto":
      return PARTES_DE_UNA_FOTO[String(paso)] ? [PARTES_DE_UNA_FOTO[String(paso)]] : [];
    default:
      return [];
  }
}
