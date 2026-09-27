import { mapearPorDia, mapearVentana, PEDIDO_POR_DIMENSION } from "./mapear";
import type { Dimension, FilaDiaria, Rango } from "./tipos";

// Cliente de la API pública de Web Analytics de Vercel. No sabe nada de ED:
// recibe proyecto, token y fechas, devuelve filas. Cómo se mapea cada
// respuesta vive en `mapear.ts`.
const BASE = "https://api.vercel.com/v1/query/web-analytics";

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

const CODIGO_DE_PAIS = /^[A-Z]{2}$/;

function codigos(paises: readonly string[]): string[] {
  for (const p of paises) if (!CODIGO_DE_PAIS.test(p)) throw new Error(`«${p}» no es un código de país ISO de dos letras.`);
  return paises.map((p) => `'${p}'`);
}

/** El filtro OData de un país: `country eq 'CL'`. */
export function soloPais(pais: string): string {
  return `country eq ${codigos([pais])[0]}`;
}

/** El filtro OData del resto: `not (country in ('CL','MX'))`. */
export function fueraDePaises(paises: readonly string[]): string {
  return `not (country in (${codigos(paises).join(",")}))`;
}

export type ClienteDeAnaliticas = {
  /** Por día (o por hora, en `hora`), con un `filtro` OData opcional. */
  porDia(rango: Rango, dimension: Dimension, filtro?: string): Promise<FilaDiaria[]>;
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
    async porDia(rango, dimension, filtro) {
      const params: Record<string, string> = { since: rango.desde, until: rango.hasta };
      if (filtro) params.filter = filtro;
      const by = ["day"];
      if (dimension !== "total") {
        const pedido = PEDIDO_POR_DIMENSION[dimension];
        if ("tiempo" in pedido) by[0] = pedido.tiempo;
        else {
          by.push(pedido.by);
          params.limit = String(pedido.limite);
        }
      }
      return mapearPorDia(await consultar("visits/aggregate", params, by), dimension);
    },
    async ventana(rango) {
      // Un rango entero sin agrupar es `visits/count`: `aggregate` exige `by`.
      // A1 lo confirma contra la respuesta real cuando haya token.
      return mapearVentana(await consultar("visits/count", { since: rango.desde, until: rango.hasta }));
    },
  };
}
