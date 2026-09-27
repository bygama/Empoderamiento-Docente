import { test } from "node:test";
import assert from "node:assert/strict";
import { rotuloDePublicacion } from "./modelo-del-equipo";
import { esquemaBorrador, esquemaPersona, type Etapa, type Persona } from "./persona";
import { personaVacia, recorridoVacio } from "./persona-vacia";

const MATERIAL = "0b6f2a3e-5c1d-4e7a-9f10-2d3c4b5a6e7f";

const etapa: Etapa = {
  clave: "produccion",
  categoria: "investigacion",
  volanta: "Escribir la investigación",
  color: "azul",
  periodo: "2014 – 2025",
  composicion: "ramas",
  titulo: "La producción, en ramas.",
  texto: "Sus trabajos publicados.",
  cita: "",
  hitos: [],
  ramas: [],
  territorios: [],
  publicaciones: [
    { origen: "biblioteca", material: MATERIAL, detalle: "Con Ricardo Cantoral · Bolema", conceptos: [], destacada: true },
    { origen: "sin-link", titulo: "Matemáticas, 1.º a 4.º grado de primaria", tipo: "Materiales", anio: "2015 – 2017", detalle: "Coautoría", conceptos: [], destacada: false },
  ],
};

const completa: Persona = {
  slug: "daniela-reyes",
  nombre: "Daniela Reyes",
  rol: "Directora General",
  pais: "Argentina",
  nivel: 1,
  foto: { src: "/equipo/daniela-reyes.jpg", alt: "Daniela Reyes", foco: { x: 0.5, y: 0.2 } },
  sinFoto: false,
  acercamiento: 1,
  recorrido: {
    nombreCompleto: "Daniela Reyes-Gasperini",
    rolCompleto: "Dirección General",
    lugar: "Santiago de Chile, Chile",
    origen: "Buenos Aires, Argentina",
    titular: "Del aula a la investigación.",
    intro: "Profesora de Matemática, investigadora y asesora educativa.",
    formacion: ["Profesora de Matemática"],
    categorias: [{ clave: "investigacion", etiqueta: "Investigación aplicada", color: "azul" }],
    figura: { tipo: "marco", foto: { src: "/equipo/daniela-reyes.jpg", alt: "Daniela Reyes-Gasperini", foco: { x: 0.5, y: 0.22 } }, apaisado: false },
    etapas: [etapa],
    cierre: { titulo: "Una trayectoria.", texto: "Del aula a la política educativa.", textoDos: "" },
  },
};

/** Los mensajes de un resultado que no pasa, por campo. */
function errores(resultado: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }): Record<string, string> {
  return Object.fromEntries((resultado.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}

const conEtapa = (cambio: Partial<Etapa>): Persona => ({ ...completa, recorrido: { ...completa.recorrido!, etapas: [{ ...etapa, ...cambio }] } });

test("una persona completa se publica; sin nivel, sin foto o con una URL con mayúsculas, no", () => {
  assert.equal(esquemaPersona.safeParse(completa).success, true);
  assert.match(errores(esquemaPersona.safeParse({ ...completa, nivel: null })).nivel, /nivel/);
  assert.match(errores(esquemaPersona.safeParse({ ...completa, foto: null })).foto, /Sin foto/);
  assert.match(errores(esquemaPersona.safeParse({ ...completa, slug: "Daniela" })).slug, /minúsculas/);
});

test("con «Sin foto» se publica sin foto, y sin recorrido es el perfil básico", () => {
  assert.equal(esquemaPersona.safeParse({ ...completa, foto: null, sinFoto: true, recorrido: null }).success, true);
});

test("una persona recién empezada se guarda como borrador pero no se publica", () => {
  assert.equal(esquemaBorrador.safeParse(personaVacia()).success, true);
  assert.equal(esquemaBorrador.safeParse({ ...personaVacia(), recorrido: recorridoVacio() }).success, true);
  assert.equal(esquemaPersona.safeParse(personaVacia()).success, false);
});

test("los errores salen en el orden del formulario: el aviso nombra primero el nombre, no la URL", () => {
  const caminos = Object.keys(errores(esquemaPersona.safeParse(personaVacia())));
  assert.deepEqual(caminos.slice(0, 4), ["nombre", "rol", "pais", "nivel"]);
  assert.ok(caminos.indexOf("slug") > caminos.indexOf("nivel"));
});

test("cada etapa va en una categoría del recorrido, y la figura en marco pide su foto", () => {
  assert.match(errores(esquemaPersona.safeParse(conEtapa({ categoria: "otra" })))["recorrido.etapas.0.categoria"], /categorías del recorrido/);
  const sinFigura = { ...completa, recorrido: { ...completa.recorrido!, figura: { tipo: "marco" as const, foto: null, apaisado: false } } };
  assert.match(errores(esquemaPersona.safeParse(sinFigura))["recorrido.figura.foto"], /figura/);
});

test("una sola destacada por etapa, y un material no se repite en la misma", () => {
  const [deLaBiblioteca, sinLink] = etapa.publicaciones;
  assert.match(errores(esquemaPersona.safeParse(conEtapa({ publicaciones: [deLaBiblioteca, { ...sinLink, destacada: true }] })))["recorrido.etapas.0.publicaciones"], /Una sola/);
  const repetido = { ...deLaBiblioteca, destacada: false };
  assert.match(errores(esquemaPersona.safeParse(conEtapa({ publicaciones: [deLaBiblioteca, repetido] })))["recorrido.etapas.0.publicaciones"], /ya está/);
});

test("un material sin elegir se guarda en el borrador y no se publica", () => {
  const sinElegir = conEtapa({ publicaciones: [{ origen: "biblioteca", material: "", detalle: "", conceptos: [], destacada: false }] });
  assert.equal(esquemaBorrador.safeParse(sinElegir).success, true);
  assert.match(errores(esquemaPersona.safeParse(sinElegir))["recorrido.etapas.0.publicaciones.0.material"], /Elegí un material/);
});

test("el rótulo de la tarjeta lee el tipo de la Biblioteca en los cuatro de hoy", () => {
  assert.equal(rotuloDePublicacion("Artículos"), "Artículo");
  assert.equal(rotuloDePublicacion("Actas de congreso"), "Artículo");
  assert.equal(rotuloDePublicacion("Capítulos de libro"), "Libro");
  assert.equal(rotuloDePublicacion("Materiales"), "Materiales");
});
