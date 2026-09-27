import { test } from "node:test";
import assert from "node:assert/strict";
import { borradorVacio } from "./contenido/modelo";
import type { NovedadDelSitio } from "./contenido/novedad";
import { feedDeNovedades } from "./rss";

const novedad = (slug: string): NovedadDelSitio => ({
  ...borradorVacio("2026-08-26"),
  id: "0b6f3c1e-5a2d-4c8e-9f1a-2b3c4d5e6f70",
  slug,
  titulo: "Una novedad",
  bajada: "Su bajada.",
  cuerpo: [],
});
const guids = (xml: string) => [...xml.matchAll(/<guid isPermaLink="false">([^<]*)<\/guid>/g)].map((m) => m[1]);
const opciones = { sitio: "https://ejemplo.org", descripcion: "Lo nuevo." };

test("el guid es el id de la fila: cambiar la URL no la duplica en los lectores", () => {
  const antes = feedDeNovedades([novedad("vieja")], opciones);
  const despues = feedDeNovedades([novedad("nueva")], opciones);
  assert.deepEqual(guids(antes), ["urn:uuid:0b6f3c1e-5a2d-4c8e-9f1a-2b3c4d5e6f70"]);
  assert.deepEqual(guids(despues), guids(antes));
  // Sin cuerpo no hay ficha: el link es el listado.
  assert.match(despues, /<link>https:\/\/ejemplo\.org\/novedades<\/link>\n\s*<guid/);
});
