// El árbol que describe un formulario: qué control va en cada lugar y con qué
// etiqueta, largo y ayuda. Sin Zod adentro: sale del servidor como JSON y el
// editor lo recorre en el navegador.

/**
 * Un largo que conviene no pasar sin que sea un tope: el SEO (Google corta el
 * título hacia los 60 caracteres). Pasado, el admin lo dice con `aviso`, pero
 * guarda igual. Es parte del «largo» con que se rotula el campo (AGENTS.md
 * §12), no un tipo nuevo.
 */
export type Recomendado = { largo: number; aviso: string };

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
