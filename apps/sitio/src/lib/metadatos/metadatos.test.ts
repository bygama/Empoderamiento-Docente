import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leerCrossref, publicacionDeCrossref } from "./crossref";
import { decodificarEntidades, jatsATexto } from "./datos";
import { reconocerEntrada } from "./entrada";
import { etiquetasDe, fechaDeEtiqueta, leerCitation, leerOpenGraph } from "./etiquetas";
import { leerOpenAlex } from "./openalex";

// Los lectores contra respuestas grabadas el 2026-09-27 (recortadas a lo que
// se lee), en `respuestas/`: Crossref y OpenAlex del artículo de RELIME, y las
// etiquetas de tres páginas reales (SciELO, la Revista Mexicana de Física E y
// la Fundación Roberto Rocca).

const aca = path.dirname(fileURLToPath(import.meta.url));
const respuesta = (archivo: string) => readFileSync(path.join(aca, "respuestas", archivo), "utf8");

test("reconoce un DOI, un ISBN que pasa su verificador y un link", () => {
  assert.deepEqual(reconocerEntrada("https://doi.org/10.12802/RELIME.2025.28.e805"), { tipo: "doi", doi: "10.12802/relime.2025.28.e805" });
  assert.deepEqual(reconocerEntrada("ISBN 978-84-16919-43-7"), { tipo: "isbn", isbn: "9788416919437" });
  assert.deepEqual(reconocerEntrada("84-16919-43-7"), { tipo: "isbn", isbn: "8416919437" });
  assert.deepEqual(reconocerEntrada("978-84-16919-43-8"), { tipo: "nada" });
  assert.deepEqual(reconocerEntrada(" https://www.redalyc.org/articulo.oa?id=1 "), { tipo: "link", url: "https://www.redalyc.org/articulo.oa?id=1" });
  assert.deepEqual(reconocerEntrada("un título cualquiera"), { tipo: "nada" });
});

test("Crossref: apellidos y nombres separados, la fecha con su precisión y el resumen en texto", () => {
  const d = leerCrossref(publicacionDeCrossref(JSON.parse(respuesta("crossref-relime.json"))));
  assert.equal(d?.titulo, "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente");
  assert.deepEqual(d?.autores?.[1], { nombre: "Karla Gómez-Osalde", apellidos: "Gómez-Osalde", nombres: "Karla" });
  assert.equal(d?.fecha, "2025-12-19");
  assert.equal(d?.revista, "Revista Latinoamericana de Investigación en Matemática Educativa");
  assert.equal(d?.doi, "10.12802/relime.2025.28.e805");
  assert.equal(d?.tipo, "journal-article");
  assert.match(d?.resumen ?? "", /^Se analiza cómo se configura la resignificación/);
  assert.equal(leerCrossref({ message: {} }), null);
  // Una búsqueda por ISBN sin resultados.
  assert.equal(publicacionDeCrossref({ status: "ok", message: { items: [] } }), null);
});

test("OpenAlex: los nombres como vienen y el resumen armado desde su índice", () => {
  const d = leerOpenAlex(JSON.parse(respuesta("openalex-relime.json")));
  assert.equal(d?.fecha, "2025-12-19");
  assert.equal(d?.autores?.[0]?.nombre, "Daniela Reyes-Gasperini");
  assert.equal(d?.revista, "Revista Latinoamericana de Investigación en Matemática Educativa");
  assert.equal(d?.paginas, undefined, "first_page y last_page iguales no son un rango");
  assert.ok((d?.resumen ?? "").split(" ").length >= 3);
});

test("las citation_* de SciELO y de una revista OJS", () => {
  const scielo = leerCitation(etiquetasDe(respuesta("pagina-scielo.html")));
  assert.equal(scielo?.titulo, "Análisis de interpretaciones de gráficas de movimiento y sus implicaciones didácticas. Un estudio de caso");
  assert.deepEqual(scielo?.autores, [{ nombre: "Eduardo Carlos Briceño Solís", apellidos: "Briceño Solís", nombres: "Eduardo Carlos" }]);
  assert.deepEqual([scielo?.fecha, scielo?.paginas, scielo?.doi, scielo?.tipo], ["2022-08", "97–117", undefined, "journal-article"]);
  const rmf = leerCitation(etiquetasDe(respuesta("pagina-rmf.html")));
  assert.deepEqual([rmf?.autores?.length, rmf?.fecha, rmf?.doi, rmf?.paginas], [4, "2026-01", "10.31349/revmexfis.23.010216", undefined]);
});

test("Open Graph, con las entidades resueltas; sin título, nada", () => {
  const rocca = leerOpenGraph(etiquetasDe(respuesta("pagina-rocca.html")));
  assert.equal(rocca?.titulo, "“Nunca recordé la tabla del 7, pero siento que soy buena en matemáticas”");
  assert.equal(rocca?.tipo, "article");
  assert.equal(leerCitation(etiquetasDe(respuesta("pagina-rocca.html"))), null);
  assert.equal(leerOpenGraph(etiquetasDe("<meta property='og:description' content='x'>")), null);
});

test("fechas de etiquetas, entidades y JATS", () => {
  assert.deepEqual(["2026/01/01", "08/2022", "2022-8-01", "2022", "sin fecha"].map(fechaDeEtiqueta), ["2026-01", "2022-08", "2022-08", "2022", undefined]);
  assert.equal(decodificarEntidades("Matem&aacute;tica &amp; &#x201C;ciencia&#8221; &raro;"), "Matemática & “ciencia” &raro;");
  assert.equal(jatsATexto("<jats:title>Resumen</jats:title><jats:p>Un  texto\n con <jats:italic>cursiva</jats:italic>.</jats:p>"), "Un texto con cursiva.");
  assert.equal(jatsATexto("<jats:p>Resumen El objetivo de este escrito.</jats:p>"), "El objetivo de este escrito.");
});
