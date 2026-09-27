import type { Dimension, FilaDiaria } from "./tipos";

// De las respuestas de la API de Web Analytics a nuestras filas. Sin dominio
// de ED. Qué pide cada dimensión, verificado contra la documentación del
// 2026-09-27 (work/metricas-completas/SPEC.md §2): `by` acepta hasta dos
// dimensiones y una sola de tiempo, y `limit` va de 1 a 100.

type Pedido = { by: string; limite: number } | { tiempo: "hour" };

export const PEDIDO_POR_DIMENSION: Record<Exclude<Dimension, "total">, Pedido> = {
  pagina: { by: "requestPath", limite: 100 },
  pais: { by: "country", limite: 30 },
  referido: { by: "referrerHostname", limite: 30 },
  dispositivo: { by: "deviceType", limite: 10 },
  sistema: { by: "osName", limite: 20 },
  navegador: { by: "browserName", limite: 20 },
  campana: { by: "utmCampaign", limite: 100 },
  // La hora es la dimensión de tiempo: va en lugar del día, sola.
  hora: { tiempo: "hour" },
};

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

/**
 * Filas de `visits/aggregate` con `by=day` (+ una dimensión), o con `by=hour`
 * → filas nuestras. En `hora`, el día es el UTC de esa hora y el valor, la
 * hora UTC («14»).
 */
export function mapearPorDia(cuerpo: unknown, dimension: Dimension): FilaDiaria[] {
  return filasDe(cuerpo).map((fila) => {
    const momento = String(fila.timestamp ?? fila.day ?? "");
    let valor = "";
    let agrupado = false;
    if (dimension === "hora") valor = momento.slice(11, 13);
    else if (dimension !== "total") {
      const pedido = PEDIDO_POR_DIMENSION[dimension];
      const crudo = "by" in pedido ? fila[pedido.by] : undefined;
      // La API junta lo que no entra en el límite en una fila «Others».
      if (crudo === null || crudo === undefined || crudo === "Others") agrupado = crudo === "Others";
      else valor = String(crudo);
    }
    return { fecha: momento.slice(0, 10), dimension, valor, agrupado, vistas: entero(fila.pageviews), visitantes: entero(fila.visitors) };
  });
}

/** Una consulta de rango sin agrupar → vistas y visitantes únicos del rango. */
export function mapearVentana(cuerpo: unknown): { vistas: number; visitantes: number } {
  const [fila] = filasDe(cuerpo);
  return { vistas: entero(fila?.pageviews), visitantes: entero(fila?.visitors) };
}
