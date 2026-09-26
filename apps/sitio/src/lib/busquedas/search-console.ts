import { ALCANCE_DE_LECTURA, pedirToken, TIEMPO_MAXIMO_MS } from "./token";
import { ErrorDeBusquedas, type DimensionDeBusqueda, type FilaDeBusqueda, type Rango } from "./tipos";

// Cliente de la API de Search Analytics de Search Console. No sabe nada de
// ED: recibe la cuenta de servicio, la propiedad y fechas, devuelve filas. La
// forma sale de la referencia de `searchanalytics.query` (verificada el
// 2026-09-26).
const BASE = "https://www.googleapis.com/webmasters/v3/sites";

/** El máximo que acepta `rowLimit`. */
const FILAS_POR_PAGINA = 25_000;

const CLAVE_POR_DIMENSION: Record<Exclude<DimensionDeBusqueda, "total">, string> = {
  consulta: "query",
  pagina: "page",
  pais: "country",
};

function explicar(estado: number): string {
  if (estado === 401) return "Google respondió 401: el permiso de acceso no sirve o venció.";
  if (estado === 403) {
    return "Google respondió 403: la cuenta de servicio no es usuaria de la propiedad. Agregala en Search Console › Configuración › Usuarios y permisos.";
  }
  if (estado === 429) return "Google respondió 429: demasiadas consultas, esperá un rato.";
  return `Google respondió ${estado}.`;
}

function numero(valor: unknown): number {
  return typeof valor === "number" && Number.isFinite(valor) ? Math.max(0, valor) : 0;
}

/** Las filas de `searchAnalytics/query` con `dimensions: ["date", …]` → filas nuestras. */
export function mapearFilas(cuerpo: unknown, dimension: DimensionDeBusqueda): FilaDeBusqueda[] {
  const filas = (cuerpo as { rows?: unknown })?.rows;
  if (!Array.isArray(filas)) return [];
  return filas.map((fila: { keys?: unknown; clicks?: unknown; impressions?: unknown; position?: unknown }) => {
    const claves = Array.isArray(fila.keys) ? fila.keys : [];
    const impresiones = Math.round(numero(fila.impressions));
    return {
      fecha: String(claves[0] ?? "").slice(0, 10),
      dimension,
      valor: dimension === "total" ? "" : String(claves[1] ?? ""),
      clics: Math.round(numero(fila.clicks)),
      impresiones,
      sumaDePosiciones: numero(fila.position) * impresiones,
    };
  });
}

export type ClienteDeBusquedas = {
  porDia(rango: Rango, dimension: DimensionDeBusqueda): Promise<FilaDeBusqueda[]>;
};

export function crearClienteDeBusquedas({
  correo,
  clave,
  propiedad,
  fetchImpl = fetch,
  filasPorPagina = FILAS_POR_PAGINA,
}: {
  correo: string;
  clave: string;
  /** `sc-domain:ejemplo.org` o `https://ejemplo.org/`. */
  propiedad: string;
  fetchImpl?: typeof fetch;
  filasPorPagina?: number;
}): ClienteDeBusquedas {
  // Un solo permiso por cliente: una corrida dura mucho menos que su hora.
  let token: Promise<string> | null = null;
  const permiso = () => (token ??= pedirToken({ correo, clave, alcance: ALCANCE_DE_LECTURA, ahora: Date.now(), fetchImpl }));

  async function consultar(cuerpo: Record<string, unknown>): Promise<unknown> {
    const res = await fetchImpl(`${BASE}/${encodeURIComponent(propiedad)}/searchAnalytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await permiso()}`, "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    if (!res.ok) throw new ErrorDeBusquedas(res.status, explicar(res.status));
    return res.json();
  }

  return {
    async porDia(rango, dimension) {
      const dimensions = dimension === "total" ? ["date"] : ["date", CLAVE_POR_DIMENSION[dimension]];
      const filas: FilaDeBusqueda[] = [];
      // Google corta en `rowLimit`: se pide la página siguiente mientras la
      // anterior llegue llena. `dataState: "final"` deja afuera los días que
      // todavía no cerró, que vuelven en la corrida siguiente.
      for (let startRow = 0; ; startRow += filasPorPagina) {
        const cuerpo = { startDate: rango.desde, endDate: rango.hasta, dimensions, type: "web", dataState: "final", rowLimit: filasPorPagina, startRow };
        const pagina = mapearFilas(await consultar(cuerpo), dimension);
        filas.push(...pagina);
        if (pagina.length < filasPorPagina) return filas;
      }
    },
  };
}
