import { test } from "node:test";
import assert from "node:assert/strict";
import { accionDe, borradorVacio, fechaDelSitio, firmaDe } from "./modelo";
import { esquemaBorrador, esquemaMaterial, type Material } from "./material";

const completo: Material = {
  titulo: "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente",
  autorias: [
    { nombre: "Daniela Reyes-Gasperini", persona: "66f2382e-31e8-494f-910c-4d1bfe962dc3" },
    { nombre: "Karla Gómez Osalde", persona: "fa0f5308-40a2-47be-a191-5638e7317c1d" },
  ],
  autores: "",
  descripcion: "Analiza cómo se resignifica el conocimiento matemático escolar.",
  tipo: "Artículos",
  tema: "Desarrollo profesional docente",
  publico: "Investigadoras e investigadores",
  fecha: "2025-12",
  formato: "PDF",
  paginas: 39,
  portada: { src: "/biblioteca/portadas/02-resignificacion-cme-relime.webp", alt: "Portada del artículo", foco: { x: 0.5, y: 0.5 } },
  url: "https://doi.org/10.12802/relime.2025.28.e805",
  fuente: "RELIME",
  doi: "10.12802/relime.2025.28.e805",
  cita: "",
  destacado: null,
  rotulo: "",
  frase: "",
  detalle: "",
};

/** Los mensajes de un resultado que no pasa, por campo. */
function errores(resultado: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }): Record<string, string> {
  return Object.fromEntries((resultado.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}

test("un material completo se publica; sin autores, con una fecha con día o con un link raro, no", () => {
  assert.equal(esquemaMaterial.safeParse(completo).success, true);
  assert.match(errores(esquemaMaterial.safeParse({ ...completo, autorias: [] })).autorias, /quién lo firma/);
  assert.match(errores(esquemaMaterial.safeParse({ ...completo, fecha: "2025-12-03" })).fecha, /el año y, si se sabe, el mes/);
  assert.match(errores(esquemaMaterial.safeParse({ ...completo, url: "javascript:alert(1)" })).url, /https:\/\//);
  assert.match(errores(esquemaMaterial.safeParse({ ...completo, url: "//otro.sitio/x" })).url, /https:\/\//);
  // Un PDF propio del sitio y un link http (hay una revista que no tiene otro) sí.
  assert.equal(esquemaMaterial.safeParse({ ...completo, url: "/biblioteca/tesis.pdf" }).success, true);
  assert.equal(esquemaMaterial.safeParse({ ...completo, url: "http://www.periodicos.ulbra.br/index.php/acta/article/view/7705" }).success, true);
});

test("un borrador vacío se guarda pero no se publica", () => {
  const vacio = borradorVacio();
  assert.equal(esquemaBorrador.safeParse(vacio).success, true);
  const faltan = Object.keys(errores(esquemaMaterial.safeParse(vacio))).sort();
  assert.deepEqual(faltan, ["autorias", "fecha", "formato", "fuente", "publico", "tema", "tipo", "titulo", "url"]);
  // Lo que está mal frena también al guardar.
  assert.equal(esquemaBorrador.safeParse({ ...vacio, doi: "no es un doi" }).success, false);
});

test("el DOI se guarda normalizado, y la persona es el id de un perfil del Equipo", () => {
  const conLink = esquemaMaterial.parse({ ...completo, doi: "https://doi.org/10.12802/RELIME.2025.28.E805" });
  assert.equal(conLink.doi, "10.12802/relime.2025.28.e805");
  const deAfuera = esquemaMaterial.safeParse({ ...completo, autorias: [{ nombre: "Alguien", persona: "no-existe" }] });
  assert.match(errores(deAfuera)["autorias.0.persona"], /Equipo/);
});

test("un destacado se publica con su rótulo, su frase y su detalle", () => {
  const faltan = errores(esquemaMaterial.safeParse({ ...completo, destacado: 1 }));
  assert.deepEqual(Object.keys(faltan).sort(), ["detalle", "frase", "rotulo"]);
  assert.equal(esquemaMaterial.safeParse({ ...completo, destacado: 1, rotulo: "RELIME 2025", frase: "Una frase.", detalle: "Un detalle." }).success, true);
  assert.equal(esquemaMaterial.safeParse({ ...completo, destacado: 5 }).success, false);
});

test("la firma sale de las autorías, salvo que esté escrita; la fecha y la acción, como las muestra el sitio", () => {
  assert.equal(firmaDe(completo), "Daniela Reyes-Gasperini y Karla Gómez Osalde");
  assert.equal(firmaDe({ autores: null, autorias: [{ nombre: "Karla Pacheco López" }, { nombre: "Iván Esteban Pérez Vera" }] }), "Karla Pacheco López e Iván Esteban Pérez Vera");
  assert.equal(firmaDe({ autores: "Judith Hernández, David Páez y Lilia Aké (editores)", autorias: [{ nombre: "Judith Hernández" }] }), "Judith Hernández, David Páez y Lilia Aké (editores)");
  assert.equal(fechaDelSitio("2025-12"), "Dic 2025");
  assert.equal(fechaDelSitio("2026"), "2026");
  assert.equal(accionDe(completo), "Leer en RELIME");
  assert.equal(accionDe({ ...completo, formato: "Web" }), "Ver en RELIME");
  assert.equal(accionDe({ ...completo, url: "/biblioteca/tesis.pdf" }), "Abrir el PDF");
});
