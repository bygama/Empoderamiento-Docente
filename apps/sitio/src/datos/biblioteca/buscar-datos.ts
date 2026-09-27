import { leerCrossref, publicacionDeCrossref } from "@/lib/metadatos/crossref";
import { reconocerEntrada } from "@/lib/metadatos/entrada";
import { etiquetasDe, leerCitation, leerOpenGraph } from "@/lib/metadatos/etiquetas";
import { leerOpenAlex } from "@/lib/metadatos/openalex";
import type { Opciones, Resultado } from "@/lib/red/pedido-protegido";
import { camposDe, juntar, type CamposDeAfuera, type Fuente } from "./de-afuera";

// «Buscar datos» (SPEC §8 de `work/biblioteca/`): lo pegado → las fuentes, en
// orden —Crossref, OpenAlex, las `citation_*` de la página, su Open Graph—,
// todas por el pedido protegido y sin cuentas. No escribe nada: devuelve los
// campos y de dónde salió cada uno. El pedido se inyecta para probarlo sin red.

export type Pedir = (url: string, o: Omit<Opciones, "agente">) => Promise<Resultado>;
export type Busqueda = { datos: CamposDeAfuera; origen: Partial<Record<keyof CamposDeAfuera, Fuente>> } | { error: string };

type Lectura = { fuente: Fuente; campos: CamposDeAfuera };

const COMO_JSON = { leerCuerpo: true, aceptar: "application/json" } as const;

/** El JSON de una API, o `null` si no contestó bien (un 404 es «no está»). */
async function json(pedir: Pedir, url: string): Promise<unknown> {
  const r = await pedir(url, COMO_JSON);
  if (!r.ok || r.estado !== 200) return null;
  try {
    return JSON.parse(r.cuerpo);
  } catch {
    return null;
  }
}

/** Crossref y, si no lo tiene, OpenAlex, para un DOI. */
async function porDoi(pedir: Pedir, doi: string, contacto: string): Promise<Lectura[]> {
  const crossref = leerCrossref(publicacionDeCrossref(await json(pedir, `https://api.crossref.org/works/${encodeURIComponent(doi)}`)));
  if (crossref) return [{ fuente: "crossref", campos: camposDe(crossref, "crossref") }];
  const openalex = leerOpenAlex(await json(pedir, `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?mailto=${encodeURIComponent(contacto)}`));
  return openalex ? [{ fuente: "openalex", campos: camposDe(openalex, "openalex") }] : [];
}

/** La página: si sus etiquetas dan un DOI, primero Crossref u OpenAlex; después sus `citation_*` y su Open Graph. */
async function porLink(pedir: Pedir, url: string, contacto: string): Promise<Lectura[] | { error: string }> {
  const r = await pedir(url, { leerCuerpo: true });
  if (!r.ok) return { error: `No se pudo leer esa página: ${r.detalle}` };
  if (r.estado >= 400) return { error: `Esa página contestó con un error (${r.estado}).` };
  if (!/html/i.test(r.tipo)) return { error: "Ese link no es una página: si es un PDF, cargalo a mano." };
  const etiquetas = etiquetasDe(r.cuerpo);
  const citation = leerCitation(etiquetas);
  const og = leerOpenGraph(etiquetas);
  const lecturas: Lectura[] = citation?.doi ? await porDoi(pedir, citation.doi, contacto) : [];
  if (citation) lecturas.push({ fuente: "pagina", campos: camposDe({ ...citation, url: citation.doi ? undefined : r.url }, "pagina") });
  if (og) lecturas.push({ fuente: "redes", campos: camposDe({ ...og, url: r.url }, "redes") });
  return lecturas;
}

export async function buscarDatos(entrada: string, { pedir, contacto }: { pedir: Pedir; contacto: string }): Promise<Busqueda> {
  const que = reconocerEntrada(entrada);
  if (que.tipo === "nada") return { error: "Eso no parece un DOI, un ISBN ni un link: revisalo, o cargá el material a mano." };
  let lecturas: Lectura[];
  if (que.tipo === "doi") lecturas = await porDoi(pedir, que.doi, contacto);
  else if (que.tipo === "isbn") {
    const crossref = leerCrossref(publicacionDeCrossref(await json(pedir, `https://api.crossref.org/works?filter=isbn:${que.isbn}&rows=1`)));
    lecturas = crossref ? [{ fuente: "crossref", campos: camposDe(crossref, "crossref") }] : [];
  } else {
    const deLaPagina = await porLink(pedir, que.url, contacto);
    if ("error" in deLaPagina) return deLaPagina;
    lecturas = deLaPagina;
  }
  if (lecturas.length === 0) return { error: "No encontramos datos de eso en Crossref, OpenAlex ni en la página: cargalo a mano." };
  return juntar(lecturas);
}
