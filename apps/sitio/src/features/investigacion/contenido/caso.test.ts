import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { esquemaBorradorDeCaso, esquemaCaso, type Caso } from "./caso";
import { CASOS_FIJOS } from "./modelo-de-casos";

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const completo: Caso = {
  slug: "un-caso",
  pregunta: "¿Qué pasa cuando un equipo docente problematiza lo que enseña?",
  eje: "Desarrollo profesional docente",
  indicio: "Una frase corta",
  periodo: "2025",
  ambito: "Secundaria",
  estado: "EN CURSO",
  contexto: "Un contexto.",
  preguntaInvestigacion: "¿Una pregunta?",
  lamina: { foto: { src: "/investigacion/caso-01-lamina.webp", alt: "Una lámina", foco: { x: 0.5, y: 0.5 } }, sujecion: "clip", rotulo: "LÁMINA 01" },
  evidencias: [{ titulo: "SEMINARIOS", descripcion: "Una descripción.", movible: true }],
  analisis: "Un análisis.",
  aprendizaje: "Lo que se aprendió.",
  queCambio: "Lo que cambió.",
  produccionRelacionada: [{ titulo: "Un artículo", href: "/biblioteca" }],
  esDemo: false,
  aclaracion: "",
};

const errores = (r: { error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) =>
  Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

test("un caso completo se publica; el borrador puede tener textos vacíos, el publicado no", () => {
  assert.equal(esquemaCaso.safeParse(completo).success, true);
  const aMedias = { ...completo, pregunta: "", evidencias: [], lamina: { ...completo.lamina, foto: { ...completo.lamina.foto, src: "" } } };
  assert.equal(esquemaBorradorDeCaso.safeParse(aMedias).success, true);
  const e = errores(esquemaCaso.safeParse(aMedias));
  assert.equal(e.pregunta, "Este texto no puede quedar vacío.");
  assert.equal(e.evidencias, "El expediente necesita al menos una evidencia.");
  assert.equal(e["lamina.foto.src"], "Falta la lámina.");
});

test("lo que la escena no aguanta no se guarda ni en un borrador", () => {
  const mal = {
    ...completo,
    slug: "en-accion",
    indicio: "x".repeat(49),
    evidencias: [{ titulo: "Seminarios", descripcion: "Una.", movible: false }],
    produccionRelacionada: [completo.produccionRelacionada[0], completo.produccionRelacionada[0]],
  };
  const e = errores(esquemaBorradorDeCaso.safeParse(mal));
  assert.match(e.slug, /sección de Investigación/);
  assert.equal(e.indicio, "Como mucho 48 caracteres.");
  assert.equal(e["evidencias.0.titulo"], "Va en mayúsculas, como el rótulo de un archivo.");
  assert.equal(e.produccionRelacionada, "Dos producciones no pueden tener el mismo título.");
});

test("los casos de la base son los fijos, con su número, y pasan esquemaCaso", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { publicadoDeCaso } = await import("@/datos/consultas/casos");
  const filas = await base.caso.findMany({ orderBy: { numero: "asc" } });
  assert.deepEqual(
    filas.map((f) => ({ id: f.id, numero: f.numero })),
    CASOS_FIJOS.map((c) => ({ ...c })),
  );
  for (const fila of filas) assert.equal(esquemaCaso.safeParse(publicadoDeCaso(fila)).success, true, fila.id);
});
