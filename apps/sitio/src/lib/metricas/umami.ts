import { ErrorDeAnaliticas, paisesDelFiltro, type ClienteDeAnaliticas } from "./cliente";
import { mapearEstadisticas, mapearMetricas, mapearSerie } from "./mapear-umami";
import { fechaUTC, sumarDias } from "./periodos";
import type { Dia, Dimension, FiltroDePais } from "./tipos";

// Cliente de la API de Umami (self-hosted, v3.4.0; verificada en su código
// fuente el 2026-09-27, work/deploy-en-vps/SPEC.md §3.5). No sabe nada de ED:
// recibe la URL, la API key y el sitio, y devuelve filas. Cómo se mapea cada
// respuesta vive en `mapear-umami.ts`.

/** Qué `type` de `/metrics/expanded` pide cada dimensión, y cuántas filas por día. */
const METRICA: Record<Exclude<Dimension, "total" | "hora">, { tipo: string; limite: number }> = {
  pagina: { tipo: "path", limite: 100 },
  pais: { tipo: "country", limite: 30 },
  referido: { tipo: "referrer", limite: 30 },
  dispositivo: { tipo: "device", limite: 10 },
  sistema: { tipo: "os", limite: 20 },
  navegador: { tipo: "browser", limite: 20 },
  campana: { tipo: "utmCampaign", limite: 100 },
};

function explicar(estado: number): string {
  if (estado === 401) return "Umami respondió 401: la API key no sirve o se revocó.";
  if (estado === 403) return "Umami respondió 403: la API key no tiene acceso a este sitio.";
  if (estado === 404) return "Umami respondió 404: no encuentra el sitio (UMAMI_WEBSITE_ID).";
  return `Umami respondió ${estado}.`;
}

/** El filtro en la sintaxis de Umami: `eq.CL`, o `neq.CL,MX` para el resto. */
export function filtroDeUmami(filtro: FiltroDePais): string {
  return `${"pais" in filtro ? "eq" : "neq"}.${paisesDelFiltro(filtro).join(",")}`;
}

/** Del primer milisegundo de `desde` al último de `hasta`, en UTC, como pide Umami. */
function enMilisegundos(desde: Dia, hasta: Dia): Record<string, string> {
  return { startAt: String(fechaUTC(desde).getTime()), endAt: String(fechaUTC(sumarDias(hasta, 1)).getTime() - 1), timezone: "UTC" };
}

function diasDe(desde: Dia, hasta: Dia): Dia[] {
  const dias: Dia[] = [];
  for (let dia = desde; dia <= hasta; dia = sumarDias(dia, 1)) dias.push(dia);
  return dias;
}

export function crearClienteDeUmami({
  url,
  apiKey,
  sitio,
  fetchImpl = fetch,
}: {
  /** Dónde escucha su API: por la red interna del compose, `http://analitica:3000`. */
  url: string;
  apiKey: string;
  sitio: string;
  fetchImpl?: typeof fetch;
}): ClienteDeAnaliticas {
  async function consultar(ruta: string, params: Record<string, string>, filtro?: FiltroDePais): Promise<unknown> {
    const pedido = new URL(`/api/websites/${encodeURIComponent(sitio)}/${ruta}`, url);
    for (const [clave, valor] of Object.entries(params)) pedido.searchParams.set(clave, valor);
    if (filtro) pedido.searchParams.set("country", filtroDeUmami(filtro));
    const res = await fetchImpl(pedido, { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } });
    if (!res.ok) throw new ErrorDeAnaliticas(res.status, explicar(res.status));
    return res.json();
  }

  return {
    async porDia(rango, dimension, filtro) {
      // El total y la hora son series: un pedido para todo el rango.
      if (dimension === "total" || dimension === "hora") {
        const unidad = dimension === "total" ? "day" : "hour";
        return mapearSerie(await consultar("pageviews", { ...enMilisegundos(rango.desde, rango.hasta), unit: unidad }, filtro), dimension);
      }
      // Una dimensión la da Umami sumada en el rango: un pedido por día.
      const { tipo, limite } = METRICA[dimension];
      const porDia = await Promise.all(
        diasDe(rango.desde, rango.hasta).map(async (dia) =>
          mapearMetricas(await consultar("metrics/expanded", { ...enMilisegundos(dia, dia), type: tipo, limit: String(limite) }, filtro), dia, dimension),
        ),
      );
      return porDia.flat();
    },
    async ventana(rango) {
      return mapearEstadisticas(await consultar("stats", enMilisegundos(rango.desde, rango.hasta)));
    },
  };
}
