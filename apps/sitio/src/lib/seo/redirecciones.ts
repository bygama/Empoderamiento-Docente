// Si una redirección escrita a mano se puede guardar: rutas relativas del
// sitio, sin cadenas ni ciclos. No sabe de ED: la app le pasa las rutas que
// existen, las redirecciones que ya hay y los prefijos que no se tocan.

export type Redireccion = { desde: string; hacia: string };

export type Contexto = {
  /** Las rutas que existen hoy: «hacia» tiene que ser una, y «desde» ninguna. */
  rutas: readonly string[];
  existentes: readonly Redireccion[];
  /** Prefijos que no se redirigen nunca («/admin», «/api»…). */
  reservadas: readonly string[];
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

const esDe = (ruta: string, prefijo: string) => ruta === prefijo || ruta.startsWith(`${prefijo}/`);

const noEsRuta = (nombre: string) =>
  `«${nombre}» tiene que ser una ruta del sitio, como /novedades/lo-viejo: empieza con una sola /, sin espacios, sin ? ni #, y hasta ${LARGO_MAXIMO} caracteres.`;

export function validarRedireccion(pedida: Redireccion, { rutas, existentes, reservadas }: Contexto): Validada {
  const desde = normalizarRuta(pedida.desde);
  if (!desde) return { ok: false, campo: "desde", detalle: noEsRuta("Desde") };
  const hacia = normalizarRuta(pedida.hacia);
  if (!hacia) return { ok: false, campo: "hacia", detalle: noEsRuta("Hacia") };
  if (desde === hacia) return { ok: false, campo: "hacia", detalle: "Una redirección no puede llevar a la misma ruta." };
  if (reservadas.some((r) => esDe(desde, r))) return { ok: false, campo: "desde", detalle: `«${desde}» no se redirige: es una ruta reservada del sitio.` };
  if (rutas.includes(desde)) {
    return { ok: false, campo: "desde", detalle: `«${desde}» es una página que existe: una redirección desde ahí no se usaría nunca.` };
  }
  if (existentes.some((r) => r.desde === desde)) return { ok: false, campo: "desde", detalle: `Ya hay una redirección desde «${desde}».` };
  const siguiente = existentes.find((r) => r.desde === hacia);
  if (siguiente) return { ok: false, campo: "hacia", detalle: `«${hacia}» ya redirige a «${siguiente.hacia}»: apuntá directo ahí, sin cadenas.` };
  if (existentes.some((r) => r.hacia === desde)) {
    return { ok: false, campo: "desde", detalle: `Ya hay una redirección que lleva a «${desde}»: sería una cadena.` };
  }
  if (!rutas.includes(hacia)) return { ok: false, campo: "hacia", detalle: `«${hacia}» no es una página del sitio: elegí una de las que existen.` };
  return { ok: true, redireccion: { desde, hacia } };
}
