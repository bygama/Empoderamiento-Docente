import { ALCANCE_DE_LECTURA, pedirToken, TIEMPO_MAXIMO_MS } from "./token";
import { ErrorDeBusquedas } from "./tipos";

// Cliente de la API de inspección de URL de Search Console: si Google tiene
// una URL en su índice. No sabe nada de ED: recibe la cuenta de servicio, la
// propiedad y la URL. La forma sale de la referencia de `urlInspection.index.
// inspect` (verificada el 2026-09-26). La cuota es de 2000 inspecciones por
// día y 600 por minuto por propiedad: quien lo usa decide cuántas pide.
const URL_DE_INSPECCION = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

export type Inspeccion = {
  /** PASS | PARTIAL | FAIL | NEUTRAL | VERDICT_UNSPECIFIED, como lo da Google. */
  veredicto: string;
  /** El `coverageState`, tal cual y en inglés: «Submitted and indexed». */
  cobertura: string;
  ultimoRastreo: Date | null;
};

function explicar(estado: number): string {
  if (estado === 403) {
    return "Google respondió 403: la cuenta de servicio no es usuaria de la propiedad, o la URL no es de ella.";
  }
  if (estado === 429) return "Google respondió 429: se pasó la cuota de inspecciones (2000 por día y 600 por minuto).";
  return `Google respondió ${estado} al inspeccionar una URL.`;
}

const texto = (valor: unknown, siNo: string) => (typeof valor === "string" && valor ? valor : siNo);

/** La respuesta de `index:inspect` → lo que guardamos. */
export function mapearInspeccion(cuerpo: unknown): Inspeccion {
  const indice = (cuerpo as { inspectionResult?: { indexStatusResult?: Record<string, unknown> } })?.inspectionResult?.indexStatusResult ?? {};
  const rastreo = typeof indice.lastCrawlTime === "string" ? new Date(indice.lastCrawlTime) : null;
  return {
    veredicto: texto(indice.verdict, "VERDICT_UNSPECIFIED"),
    cobertura: texto(indice.coverageState, ""),
    ultimoRastreo: rastreo && !Number.isNaN(rastreo.getTime()) ? rastreo : null,
  };
}

export type ClienteDeInspeccion = { inspeccionar(url: string): Promise<Inspeccion> };

export function crearClienteDeInspeccion({
  correo,
  clave,
  propiedad,
  fetchImpl = fetch,
}: {
  correo: string;
  clave: string;
  /** `sc-domain:ejemplo.org` o `https://ejemplo.org/`: la URL tiene que ser de esta propiedad. */
  propiedad: string;
  fetchImpl?: typeof fetch;
}): ClienteDeInspeccion {
  // Un solo permiso por cliente: una corrida dura mucho menos que su hora.
  let token: Promise<string> | null = null;
  const permiso = () => (token ??= pedirToken({ correo, clave, alcance: ALCANCE_DE_LECTURA, ahora: Date.now(), fetchImpl }));
  return {
    async inspeccionar(url) {
      const res = await fetchImpl(URL_DE_INSPECCION, {
        method: "POST",
        headers: { Authorization: `Bearer ${await permiso()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: propiedad, languageCode: "es" }),
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      });
      if (!res.ok) throw new ErrorDeBusquedas(res.status, explicar(res.status));
      return mapearInspeccion(await res.json());
    },
  };
}
