import type { Dimension, FilaDiaria, Rango } from "./tipos";

// Cliente de la API pública de Web Analytics de Vercel. No sabe nada de ED:
// recibe proyecto, token y fechas, devuelve filas.
const BASE = "https://api.vercel.com/v1/query/web-analytics";

const CLAVE_POR_DIMENSION: Record<Exclude<Dimension, "total">, { by: string; limite: number }> = {
  pagina: { by: "requestPath", limite: 100 },
  pais: { by: "country", limite: 30 },
  referido: { by: "referrerHostname", limite: 30 },
  dispositivo: { by: "deviceType", limite: 10 },
};

export class ErrorDeAnaliticas extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeAnaliticas";
  }
}

function explicar(estado: number): string {
  if (estado === 401) return "Vercel respondió 401: el token no sirve o venció.";
  if (estado === 403) return "Vercel respondió 403: el token no tiene acceso a este proyecto.";
  if (estado === 429) return "Vercel respondió 429: demasiadas consultas, esperá un minuto.";
  return `Vercel respondió ${estado}.`;
}

type Fila = Record<string, unknown>;

function filasDe(cuerpo: unknown): Fila[] {
  const data = (cuerpo as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as Fila[];
  if (data && typeof data === "object") return [data as Fila];
  return [];
}

function entero(valor: unknown): number {
  return typeof valor === "number" && Number.isFinite(valor) ? Math.max(0, Math.round(valor)) : 0;
}

/** Filas de `visits/aggregate` con `by=day` (+ una dimensión) → filas nuestras. */
export function mapearPorDia(cuerpo: unknown, dimension: Dimension): FilaDiaria[] {
  return filasDe(cuerpo).map((fila) => {
    const dia = String(fila.timestamp ?? fila.day ?? "").slice(0, 10);
    let valor = "";
    let agrupado = false;
    if (dimension !== "total") {
      const crudo = fila[CLAVE_POR_DIMENSION[dimension].by];
      // La API junta lo que no entra en el límite en una fila «Others».
      if (crudo === null || crudo === undefined || crudo === "Others") agrupado = crudo === "Others";
      else valor = String(crudo);
    }
    return { fecha: dia, dimension, valor, agrupado, vistas: entero(fila.pageviews), visitantes: entero(fila.visitors) };
  });
}

/** Una consulta de rango sin agrupar → vistas y visitantes únicos del rango. */
export function mapearVentana(cuerpo: unknown): { vistas: number; visitantes: number } {
  const [fila] = filasDe(cuerpo);
  return { vistas: entero(fila?.pageviews), visitantes: entero(fila?.visitors) };
}

export type ClienteDeAnaliticas = {
  porDia(rango: Rango, dimension: Dimension): Promise<FilaDiaria[]>;
  ventana(rango: Rango): Promise<{ vistas: number; visitantes: number }>;
};

export function crearClienteDeAnaliticas({
  token,
  proyecto,
  equipo,
  fetchImpl = fetch,
}: {
  token: string;
  proyecto: string;
  equipo?: string;
  fetchImpl?: typeof fetch;
}): ClienteDeAnaliticas {
  async function consultar(ruta: "visits/aggregate" | "visits/count", params: Record<string, string>, by: string[] = []): Promise<unknown> {
    const url = new URL(`${BASE}/${ruta}`);
    url.searchParams.set("projectId", proyecto);
    if (equipo) url.searchParams.set("teamId", equipo);
    for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, valor);
    // Forma pendiente de confirmar en A1 (todavía no corrió): parámetro repetido.
    // Si la API pide "day,x" junto en vez de repetido, cambiar por
    // url.searchParams.set("by", by.join(",")).
    for (const b of by) url.searchParams.append("by", b);
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new ErrorDeAnaliticas(res.status, explicar(res.status));
    return res.json();
  }

  return {
    async porDia(rango, dimension) {
      const params: Record<string, string> = { since: rango.desde, until: rango.hasta };
      const by = ["day"];
      if (dimension !== "total") {
        by.push(CLAVE_POR_DIMENSION[dimension].by);
        params.limit = String(CLAVE_POR_DIMENSION[dimension].limite);
      }
      return mapearPorDia(await consultar("visits/aggregate", params, by), dimension);
    },
    async ventana(rango) {
      // Rama pendiente de confirmar en A1 (todavía no corrió): (a) aggregate sin
      // `by`; si la API lo rechaza con 400, (b) count con since/until. Cuando A1
      // corra contra la API real, confirma esta estrategia o la cambia acá.
      try {
        return mapearVentana(await consultar("visits/aggregate", { since: rango.desde, until: rango.hasta }));
      } catch (e) {
        if (e instanceof ErrorDeAnaliticas && e.estado === 400) {
          return mapearVentana(await consultar("visits/count", { since: rango.desde, until: rango.hasta }));
        }
        throw e;
      }
    },
  };
}
