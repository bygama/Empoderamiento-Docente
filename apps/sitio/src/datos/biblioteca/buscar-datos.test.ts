import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buscarDatos, type Pedir } from "./buscar-datos";

// «Buscar datos» sin red: el pedido contesta con las respuestas grabadas de
// `lib/metadatos/respuestas/`, y lo que no está en el guion da 404.

const respuestas = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../lib/metadatos/respuestas");
const grabada = (archivo: string) => readFileSync(path.join(respuestas, archivo), "utf8");

const CROSSREF_RELIME = "https://api.crossref.org/works/10.12802%2Frelime.2025.28.e805";
const OPENALEX_RELIME = "https://api.openalex.org/works/doi:10.12802%2Frelime.2025.28.e805?mailto=contacto%40ejemplo.org";

/** Un pedido que contesta según la URL, y anota qué se pidió. */
function pedidoDe(guion: Record<string, { tipo: string; cuerpo: string }>, pedidas: string[] = []): Pedir {
  return async (url) => {
    pedidas.push(url);
    const r = guion[url];
    return r ? { ok: true, estado: 200, url, tipo: r.tipo, cuerpo: r.cuerpo, truncado: false } : { ok: true, estado: 404, url, tipo: "text/plain", cuerpo: "", truncado: false };
  };
}
const json = (archivo: string) => ({ tipo: "application/json", cuerpo: grabada(archivo) });
const html = (archivo: string) => ({ tipo: "text/html; charset=utf-8", cuerpo: grabada(archivo) });
const contacto = "contacto@ejemplo.org";

test("un DOI: todo de Crossref, con la cita de apellidos exactos y el tipo pasado a uno de los siete", async () => {
  const r = await buscarDatos("https://doi.org/10.12802/relime.2025.28.e805", { pedir: pedidoDe({ [CROSSREF_RELIME]: json("crossref-relime.json") }), contacto });
  if ("error" in r) return assert.fail(r.error);
  assert.equal(r.datos.titulo, "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente");
  assert.deepEqual(r.datos.autorias, [
    { nombre: "Daniela Reyes-Gasperini", persona: null },
    { nombre: "Karla Gómez-Osalde", persona: null },
  ]);
  assert.deepEqual([r.datos.fecha, r.datos.tipo, r.datos.doi, r.datos.url], ["2025-12", "Artículos", "10.12802/relime.2025.28.e805", "https://doi.org/10.12802/relime.2025.28.e805"]);
  assert.match(r.datos.cita ?? "", /^Reyes-Gasperini, D. y Gómez-Osalde, K. \(2025\)\./);
  assert.ok(Object.values(r.origen).every((f) => f === "crossref"));
});

test("un DOI que Crossref no tiene va a OpenAlex", async () => {
  const pedidas: string[] = [];
  const r = await buscarDatos("10.12802/relime.2025.28.e805", { pedir: pedidoDe({ [OPENALEX_RELIME]: json("openalex-relime.json") }, pedidas), contacto });
  if ("error" in r) return assert.fail(r.error);
  assert.deepEqual(pedidas, [CROSSREF_RELIME, OPENALEX_RELIME]);
  assert.equal(r.origen.titulo, "openalex");
  assert.equal(r.datos.autorias?.[1]?.nombre, "Karla Gómez-Osalde");
});

test("un link: las citation_* de la página, y si traen un DOI, primero Crossref", async () => {
  const scielo = "https://www.scielo.org.mx/articulo";
  const r = await buscarDatos(scielo, { pedir: pedidoDe({ [scielo]: html("pagina-scielo.html") }), contacto });
  if ("error" in r) return assert.fail(r.error);
  assert.deepEqual([r.datos.fecha, r.datos.paginas, r.datos.tipo, r.datos.url, r.origen.titulo], ["2022-08", 21, "Artículos", scielo, "pagina"]);

  const rmf = "https://rmf.smf.mx/ojs/index.php/rmf-e/article/view/8047";
  const pedidas: string[] = [];
  const conDoi = await buscarDatos(rmf, { pedir: pedidoDe({ [rmf]: html("pagina-rmf.html") }, pedidas), contacto });
  if ("error" in conDoi) return assert.fail(conDoi.error);
  assert.equal(pedidas[1], "https://api.crossref.org/works/10.31349%2Frevmexfis.23.010216");
  assert.deepEqual([conDoi.datos.doi, conDoi.datos.url, conDoi.origen.titulo], ["10.31349/revmexfis.23.010216", "https://doi.org/10.31349/revmexfis.23.010216", "pagina"]);
});

test("una página con solo Open Graph; un PDF, algo que no es nada y lo que no se encuentra lo dicen", async () => {
  const rocca = "https://www.robertorocca.org/es/articulos/2022/nota";
  const r = await buscarDatos(rocca, { pedir: pedidoDe({ [rocca]: html("pagina-rocca.html") }), contacto });
  if ("error" in r) return assert.fail(r.error);
  assert.deepEqual([r.origen.titulo, r.datos.tipo, r.datos.fuente], ["redes", undefined, undefined]);
  assert.match(r.datos.descripcion ?? "", /dentro del grupo de las personas/);

  const pdf = "https://ejemplo.org/a.pdf";
  const noPagina = await buscarDatos(pdf, { pedir: pedidoDe({ [pdf]: { tipo: "application/pdf", cuerpo: "%PDF" } }), contacto });
  assert.match("error" in noPagina ? noPagina.error : "", /no es una página/);
  const nada = await buscarDatos("un título", { pedir: pedidoDe({}), contacto });
  assert.match("error" in nada ? nada.error : "", /no parece un DOI/);
  const isbn = await buscarDatos("978-84-16919-43-7", { pedir: pedidoDe({}), contacto });
  assert.match("error" in isbn ? isbn.error : "", /No encontramos datos/);
});

test("un DOI con caracteres raros va codificado entero: a Crossref y a OpenAlex", async () => {
  // Un DOI SICI, con «#» y «?» al final: sin codificar, cortarían la ruta y armarían otra consulta.
  const pedidas: string[] = [];
  await buscarDatos("10.1002/(sici)1097-4571(199806)49:8<693::aid-asi4>3.0.co;2-o#x?y", { pedir: pedidoDe({}, pedidas), contacto });
  assert.deepEqual(pedidas, [
    "https://api.crossref.org/works/10.1002%2F(sici)1097-4571(199806)49%3A8%3C693%3A%3Aaid-asi4%3E3.0.co%3B2-o%23x%3Fy",
    "https://api.openalex.org/works/doi:10.1002%2F(sici)1097-4571(199806)49%3A8%3C693%3A%3Aaid-asi4%3E3.0.co%3B2-o%23x%3Fy?mailto=contacto%40ejemplo.org",
  ]);
  const openalex = new URL(pedidas[1]!);
  assert.deepEqual([[...openalex.searchParams.keys()], openalex.hash], [["mailto"], ""]);
});
