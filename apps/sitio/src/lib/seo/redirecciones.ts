import { laContestaSola, type RutaDeclarada } from "./rutas";

// Si una redirección escrita a mano se puede guardar: rutas relativas del
// sitio, sin cadenas ni ciclos, y desde una ruta donde se aplicaría. No sabe de
// ED: la app le pasa las rutas que existen, las redirecciones que ya hay y lo
// que el sitio contesta por su cuenta.

export type Redireccion = { desde: string; hacia: string };

export type Contexto = {
  /** Las páginas que existen hoy (las del sitemap): «hacia» tiene que ser una, y «desde» ninguna. */
  rutas: readonly string[];
  existentes: readonly Redireccion[];
  /** Todo lo que el sitio contesta por su cuenta: «desde» no puede caer en ninguna. */
  declaradas: readonly RutaDeclarada[];
};

export type Validada = { ok: true; redireccion: Redireccion } | { ok: false; campo: "desde" | "hacia"; detalle: string };

const LARGO_MAXIMO = 200;

/**
 * La ruta escrita, sin espacios alrededor y sin barra final (salvo «/»), o
 * `null` si no es una ruta relativa del sitio: empieza con una sola «/» (con
 * dos sería otro dominio), sin espacios, «\», «?» ni «#».
 */
export function normalizarRuta(escrita: string): string | null {
  const ruta = escrita.trim().replace(/(.)\/+$/, "$1");
  if (!ruta.startsWith("/") || ruta.startsWith("//") || ruta.length > LARGO_MAXIMO) return null;
  return /[\s\\?#]/.test(ruta) ? null : ruta;
}

/**
 * La ruta de los segmentos de una ruta atrapa-todo, cada uno como se
 * escribió: el framework puede entregarlos todavía codificados («a%C3%B1o»).
 */
export function rutaDeSegmentos(segmentos: readonly string[]): string {
  const decodificar = (segmento: string) => {
    try {
      return decodeURIComponent(segmento);
    } catch {
      return segmento;
    }
  };
  return `/${segmentos.map(decodificar).join("/")}`;
}

const noEsRuta = (nombre: string) =>
  `«${nombre}» tiene que ser una ruta del sitio, como /novedades/lo-viejo: empieza con una sola /, sin espacios, sin ? ni #, y hasta ${LARGO_MAXIMO} caracteres.`;

/**
 * Por qué una redirección desde `ruta` no se aplicaría nunca, o `null` si se
 * aplica: el sitio ya la contesta, sea una declarada que no busca
 * redirecciones o una de `rutas` (como la ficha de una novedad que existe).
 */
export function porQueNoSeAplicaria(ruta: string, { rutas, declaradas }: Pick<Contexto, "rutas" | "declaradas">): string | null {
  const declarada = laContestaSola(ruta, declaradas);
  if (declarada?.contesta === "archivos") return `«${ruta}» es la ruta de un archivo de ${declarada.ruta}, donde el sitio sirve sus archivos: esas no se redirigen.`;
  if (declarada || rutas.includes(ruta)) return `«${ruta}» ya existe en el sitio: una redirección ahí nunca se aplicaría.`;
  return null;
}

export function validarRedireccion(pedida: Redireccion, contexto: Contexto): Validada {
  const { rutas, existentes } = contexto;
  const desde = normalizarRuta(pedida.desde);
  if (!desde) return { ok: false, campo: "desde", detalle: noEsRuta("Desde") };
  const hacia = normalizarRuta(pedida.hacia);
  if (!hacia) return { ok: false, campo: "hacia", detalle: noEsRuta("Hacia") };
  if (desde === hacia) return { ok: false, campo: "hacia", detalle: "Una redirección no puede llevar a la misma ruta." };
  const noSeAplicaria = porQueNoSeAplicaria(desde, contexto);
  if (noSeAplicaria) return { ok: false, campo: "desde", detalle: noSeAplicaria };
  if (existentes.some((r) => r.desde === desde)) return { ok: false, campo: "desde", detalle: `Ya hay una redirección desde «${desde}».` };
  const siguiente = existentes.find((r) => r.desde === hacia);
  if (siguiente) return { ok: false, campo: "hacia", detalle: `«${hacia}» ya redirige a «${siguiente.hacia}»: apuntá directo ahí, sin cadenas.` };
  if (existentes.some((r) => r.hacia === desde)) {
    return { ok: false, campo: "desde", detalle: `Ya hay una redirección que lleva a «${desde}»: sería una cadena.` };
  }
  if (!rutas.includes(hacia)) return { ok: false, campo: "hacia", detalle: `«${hacia}» no es una página del sitio: elegí una de las que existen.` };
  return { ok: true, redireccion: { desde, hacia } };
}
