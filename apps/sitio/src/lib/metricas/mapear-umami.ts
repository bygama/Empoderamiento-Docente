import type { Dia, Dimension, FilaDiaria } from "./tipos";

// De las respuestas de la API de Umami a nuestras filas. Sin dominio de ED.
// Las formas salen de respuestas grabadas de una instancia v3.4.0
// (`__fixtures__/umami/`).

type Punto = { x?: unknown; y?: unknown };

function entero(valor: unknown): number {
  const n = typeof valor === "string" ? Number(valor) : valor;
  return typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

const puntosDe = (serie: unknown): Punto[] => (Array.isArray(serie) ? (serie as Punto[]) : []);

/**
 * `/pageviews` (`unit=day` u `hour`) → filas del total o de la hora. Umami da
 * dos series, vistas y sesiones, con `x` = el momento en ISO y en UTC
 * («2026-09-27T21:00:00Z»); se juntan por ese momento.
 */
export function mapearSerie(cuerpo: unknown, dimension: "total" | "hora"): FilaDiaria[] {
  const { pageviews, sessions } = (cuerpo ?? {}) as { pageviews?: unknown; sessions?: unknown };
  const porMomento = new Map<string, { vistas: number; visitantes: number }>();
  const en = (x: unknown) => {
    const clave = String(x ?? "");
    if (!porMomento.has(clave)) porMomento.set(clave, { vistas: 0, visitantes: 0 });
    return porMomento.get(clave)!;
  };
  for (const p of puntosDe(pageviews)) en(p.x).vistas += entero(p.y);
  for (const p of puntosDe(sessions)) en(p.x).visitantes += entero(p.y);
  return [...porMomento]
    .filter(([momento]) => /^\d{4}-\d{2}-\d{2}/.test(momento))
    .map(([momento, cifras]) => ({
      fecha: momento.slice(0, 10),
      dimension,
      valor: dimension === "hora" ? momento.slice(11, 13) : "",
      agrupado: false,
      ...cifras,
    }));
}

const DISPOSITIVOS: Record<string, string> = { laptop: "desktop" };
const SISTEMAS: Record<string, string> = { "Mac OS": "macOS", "Android OS": "Android", "Chrome OS": "ChromeOS" };
const NAVEGADORES: Record<string, string> = {
  chrome: "Chrome",
  crios: "Chrome",
  "chromium-webview": "Chrome",
  firefox: "Firefox",
  fxios: "Firefox",
  safari: "Safari",
  ios: "Safari",
  "ios-webview": "Safari",
  edge: "Edge",
  "edge-chromium": "Edge",
  "edge-ios": "Edge",
  opera: "Opera",
  samsung: "Samsung Internet",
  facebook: "Facebook",
  instagram: "Instagram",
};

/**
 * El nombre de siempre para lo que Umami nombra a su manera: `laptop` es una
 * computadora, «Mac OS» es macOS y `crios` es Chrome en un iPhone. Lo que no
 * está en las tablas queda tal cual (con mayúscula, si es un navegador).
 */
function nombreDe(dimension: Dimension, valor: string): string {
  if (dimension === "dispositivo") return DISPOSITIVOS[valor] ?? valor;
  if (dimension === "sistema") return /^Windows/.test(valor) ? "Windows" : (SISTEMAS[valor] ?? valor);
  if (dimension === "navegador") return NAVEGADORES[valor] ?? valor.charAt(0).toUpperCase() + valor.slice(1);
  return valor;
}

/**
 * `/metrics/expanded` de un día → sus filas. Sin `name` (una visita directa,
 * sin referido) queda la cadena vacía. Dos nombres que se vuelven uno (`laptop`
 * y `desktop`) se suman: una sesión tiene un solo dispositivo, así que los
 * visitantes también se suman sin contar a nadie dos veces.
 */
export function mapearMetricas(cuerpo: unknown, dia: Dia, dimension: Dimension): FilaDiaria[] {
  const filas = new Map<string, FilaDiaria>();
  for (const fila of Array.isArray(cuerpo) ? (cuerpo as Array<Record<string, unknown>>) : []) {
    const valor = nombreDe(dimension, typeof fila.name === "string" ? fila.name : "");
    const ya = filas.get(valor) ?? { fecha: dia, dimension, valor, agrupado: false, vistas: 0, visitantes: 0 };
    filas.set(valor, { ...ya, vistas: ya.vistas + entero(fila.pageviews), visitantes: ya.visitantes + entero(fila.visitors) });
  }
  return [...filas.values()];
}

/** `/stats` → vistas y visitantes únicos del rango. */
export function mapearEstadisticas(cuerpo: unknown): { vistas: number; visitantes: number } {
  const { pageviews, visitors } = (cuerpo ?? {}) as { pageviews?: unknown; visitors?: unknown };
  return { vistas: entero(pageviews), visitantes: entero(visitors) };
}
